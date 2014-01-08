var Karma  = require('../../client/karma');
var MockSocket = require('./mocks').Socket;


describe('Karma', function() {
  var socket, k, spyStart, windowNavigator, windowLocation, spyWindowOpener;

  var setTransportTo = function(transportName) {
    socket._setTransportNameTo(transportName);
    socket.emit('connect');
  };


  beforeEach(function() {
    socket = new MockSocket();
    windowNavigator = {};
    windowLocation = {search: ''};
    spyWindowOpener = jasmine.createSpy('window.open').andReturn({});
    k = new Karma(socket, {}, spyWindowOpener, windowNavigator, windowLocation);
    spyStart = spyOn(k, 'start');
  });


  it('should start execution when all files loaded and pass config', function() {
    var config = {
      useIframe: true
    };

    socket.emit('execute', config);
    expect(spyStart).not.toHaveBeenCalled();

    k.loaded();
    expect(spyStart).toHaveBeenCalledWith(config);
  });


  it('should open a new window when useIFrame is false', function() {
    var config = {
      useIframe: false
    };

    socket.emit('execute', config);
    expect(spyStart).not.toHaveBeenCalled();

    k.loaded();
    expect(spyStart).toHaveBeenCalledWith(config);
    expect(spyWindowOpener).toHaveBeenCalledWith('about:blank');
  });


  it('should not start execution if any error during loading files', function() {
    k.error('syntax error', '/some/file.js', 11);
    k.loaded();

    expect(spyStart).not.toHaveBeenCalled();
  });


  it('should remove reference to start even after syntax error', function() {
    var ADAPTER_START_FN = function() {};

    k.start = ADAPTER_START_FN;
    k.error('syntax error', '/some/file.js', 11);
    k.loaded();
    expect(k.start).not.toBe(ADAPTER_START_FN);

    k.start = ADAPTER_START_FN;
    k.loaded();
    expect(k.start).not.toBe(ADAPTER_START_FN);
  });


  it('should not set up context if there was an error', function() {
    var mockWindow = {};

    k.error('page reload');
    k.setupContext(mockWindow);

    expect(mockWindow.__karma__).toBeUndefined();
    expect(mockWindow.onbeforeunload).toBeUndefined();
    expect(mockWindow.onerror).toBeUndefined();
  });


  it('should report navigator name', function() {
    var spyInfo = jasmine.createSpy('onInfo').andCallFake(function(info) {
      expect(info.name).toBe('Fake browser name');
    });

    windowNavigator.userAgent = 'Fake browser name';
    windowLocation.search = '';
    socket.on('register', spyInfo);
    socket.emit('connect');

    expect(spyInfo).toHaveBeenCalled();
  });


  it('should report browser id', function() {
    windowLocation.search = '?id=567';
    socket = new MockSocket();
    k = new Karma(socket, {}, window.open, windowNavigator, windowLocation);

    var spyInfo = jasmine.createSpy('onInfo').andCallFake(function(info) {
      expect(info.id).toBe('567');
    });

    socket.on('register', spyInfo);
    socket.emit('connect');

    expect(spyInfo).toHaveBeenCalled();
  });


  describe('result', function() {
    var spyResult;

    beforeEach(function() {
      spyResult = jasmine.createSpy('onResult');
      socket.on('result', spyResult);
    });


    it('should buffer results when polling', function() {
      setTransportTo('xhr-polling');

      // emit 49 results
      for (var i = 1; i < 50; i++) {
        k.result({id: i});
      }

      expect(spyResult).not.toHaveBeenCalled();

      k.result('result', {id: 50});
      expect(spyResult).toHaveBeenCalled();
      expect(spyResult.argsForCall[0][0].length).toBe(50);
    });


    it('should buffer results when polling', function() {
      setTransportTo('xhr-polling');

      // emit 40 results
      for (var i = 1; i <= 40; i++) {
        k.result({id: i});
      }

      k.complete();
      expect(spyResult).toHaveBeenCalled();
      expect(spyResult.argsForCall[0][0].length).toBe(40);
    });


    it('should emit "start" with total specs count first', function() {
      var log = [];
      spyResult.andCallFake(function() {
        log.push('result');
      });

      socket.on('start', function() {
        log.push('start');
      });

      // adapter didn't call info({total: x})
      k.result();
      expect(log).toEqual(['start', 'result']);
    });


    it('should not emit "start" if already done by the adapter', function() {
      var log = [];
      var spyStart = jasmine.createSpy('onStart').andCallFake(function() {
        log.push('start');
      });
      spyResult.andCallFake(function() {
        log.push('result');
      });

      socket.on('start', spyStart);

      k.info({total: 321});
      k.result();
      expect(log).toEqual(['start', 'result']);
      expect(spyStart).toHaveBeenCalledWith({total: 321});
    });
  });


  describe('setupContext', function() {
    it('should capture alert', function() {
      spyOn(k, 'log');

      var mockWindow = {
        alert: function() {
          throw 'Alert was not patched!';
        }
      };

      k.setupContext(mockWindow);
      mockWindow.alert('What?');
      expect(k.log).toHaveBeenCalledWith('alert', ['What?']);
    })
  });


  describe('store', function() {

    it('should be getter/setter', function() {
      k.store('a', 10);
      k.store('b', [1, 2, 3]);

      expect(k.store('a')).toBe(10);
      expect(k.store('b')).toEqual([1, 2, 3]);
    });


    it('should clone arrays to avoid memory leaks', function() {
      var array = [1, 2, 3, 4, 5];

      k.store('one.array', array);
      expect(k.store('one.array')).toEqual(array);
      expect(k.store('one.array')).not.toBe(array);
    });
  });


  describe('complete', function() {

    beforeEach(function() {
      spyOn(window, 'setTimeout').andCallFake(function(fn) {
        fn();
      });
    });


    it('should clean the result buffer before completing', function() {
      var spyResult = jasmine.createSpy('onResult');
      socket.on('result', spyResult);

      setTransportTo('xhr-polling');

      // emit 40 results
      for (var i = 0; i < 40; i++) {
        k.result({id: i});
      }

      expect(spyResult).not.toHaveBeenCalled();

      k.complete();
      expect(spyResult).toHaveBeenCalled();
    });


    it('should navigate the client to return_url if specified', function() {
      windowLocation.search = '?id=567&return_url=http://return.com';
      socket = new MockSocket();
      k = new Karma(socket, {}, window.open, windowNavigator, windowLocation);

      spyOn(socket, 'disconnect');

      k.complete();
      expect(windowLocation.href).toBe('http://return.com');
    });

    it('should patch the console if captureConsole is true', function() {
      spyOn(k, 'log');
      k.config.captureConsole = true;

      var mockWindow = {
        console: {
          log: function () {}
        }
      };

      k.setupContext(mockWindow);
      mockWindow.console.log('What?');
      expect(k.log).toHaveBeenCalledWith('log', ['What?']);
    });

    it('should not patch the console if captureConsole is false', function() {
      spyOn(k, 'log');
      k.config.captureConsole = false;

      var mockWindow = {
        console: {
          log: function () {}
        }
      };

      k.setupContext(mockWindow);
      mockWindow.console.log('hello');
      expect(k.log).not.toHaveBeenCalled();
    });
  });
});
