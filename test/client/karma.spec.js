var sinon = require('sinon');
var chai = require('chai');
chai.use(require('sinon-chai'));
var expect = chai.expect

var Karma  = require('../../client/karma');
var MockSocket = require('./mocks').Socket;


describe('Karma', function() {
  var socket, k, windowNavigator, windowLocation, windowStub, startSpy;

  var setTransportTo = function(transportName) {
    socket._setTransportNameTo(transportName);
    socket.emit('connect');
  };

  beforeEach(function() {
    socket = new MockSocket();
    windowNavigator = {};
    windowLocation = {search: ''};
    windowStub = sinon.stub().returns({});

    k = new Karma(socket, {}, windowStub, windowNavigator, windowLocation);
    startSpy = sinon.spy(k, 'start');
  });

  it('should start execution when all files loaded and pass config', function() {
    var config = {
      useIframe: true
    };

    socket.emit('execute', config);
    expect(startSpy).to.not.have.been.called;

    k.loaded();
    expect(startSpy).to.have.been.calledWith(config);
  });


  it('should open a new window when useIFrame is false', function() {
    var config = {
      useIframe: false
    };

    socket.emit('execute', config);
    expect(k.start).to.not.have.been.called;

    k.loaded();
    expect(startSpy).to.have.been.calledWith(config);
    expect(windowStub).to.have.been.calledWith('about:blank');
  });


  it('should not start execution if any error during loading files', function() {
    k.error('syntax error', '/some/file.js', 11);
    k.loaded();
    sinon.spy(k, 'start');
    expect(startSpy).to.not.have.been.called;
  });


  it('should remove reference to start even after syntax error', function() {
    var ADAPTER_START_FN = function() {};

    k.start = ADAPTER_START_FN;
    k.error('syntax error', '/some/file.js', 11);
    k.loaded();
    expect(k.start).to.not.be.eql(ADAPTER_START_FN);

    k.start = ADAPTER_START_FN;
    k.loaded();
    expect(k.start).to.not.be.eql(ADAPTER_START_FN);
  });


  it('should not set up context if there was an error', function() {
    var mockWindow = {};

    k.error('page reload');
    k.setupContext(mockWindow);

    expect(mockWindow.__karma__).to.not.exist;
    expect(mockWindow.onbeforeunload).to.not.exist;
    expect(mockWindow.onerror).to.not.exist;
  });


  it('should report navigator name', function() {
    var spyInfo = sinon.spy(function(info) {
      expect(info.name).to.be.eql('Fake browser name');
    });

    windowNavigator.userAgent = 'Fake browser name';
    windowLocation.search = '';
    socket.on('register', spyInfo);
    socket.emit('connect');

    expect(spyInfo).to.have.been.called;
  });


  it('should report browser id', function() {
    windowLocation.search = '?id=567';
    socket = new MockSocket();
    k = new Karma(socket, {}, windowStub, windowNavigator, windowLocation);

    var spyInfo = sinon.spy(function(info) {
      expect(info.id).to.be.eql('567');
    });

    socket.on('register', spyInfo);
    socket.emit('connect');

    expect(spyInfo).to.have.been.called;
  });


  describe('result', function() {
    it('should buffer results when polling', function() {
      var spyResult = sinon.stub();
      socket.on('result', spyResult);

      setTransportTo('polling');

      // emit 49 results
      for (var i = 1; i < 50; i++) {
        k.result({id: i});
      }

      expect(spyResult).to.not.have.been.called;

      k.result('result', {id: 50});
      expect(spyResult).to.have.been.called;
      expect(spyResult.args[0][0].length).to.be.eql(50);
    });


    it('should buffer results when polling', function() {
      var spyResult = sinon.stub();
      socket.on('result', spyResult);

      setTransportTo('polling');

      // emit 40 results
      for (var i = 1; i <= 40; i++) {
        k.result({id: i});
      }

      k.complete();
      expect(spyResult).to.have.been.called;
      expect(spyResult.args[0][0].length).to.be.eql(40);
    });


    it('should emit "start" with total specs count first', function() {
      var log = [];

      socket.on('result', function() {
        log.push('result');
      });

      socket.on('start', function() {
        log.push('start');
      });

      setTransportTo('websocket');

      // adapter didn't call info({total: x})
      k.result();
      expect(log).to.be.eql(['start', 'result']);
    });


    it('should not emit "start" if already done by the adapter', function() {
      var log = [];

      var spyStart = sinon.spy(function() {
        log.push('start');
      });

      spyResult = sinon.spy(function() {
        log.push('result');
      });

      socket.on('result', spyResult);
      socket.on('start', spyStart);

      setTransportTo('websocket');

      k.info({total: 321});
      k.result();
      expect(log).to.be.eql(['start', 'result']);
      expect(spyStart).to.have.been.calledWith({total: 321});
    });
  });


  describe('setupContext', function() {
    it('should capture alert', function() {
      sinon.spy(k, 'log');

      var mockWindow = {
        alert: function() {
          throw 'Alert was not patched!';
        }
      };

      k.setupContext(mockWindow);
      mockWindow.alert('What?');
      expect(k.log).to.have.been.calledWith('alert', ['What?']);
    })
  });


  describe('store', function() {

    it('should be getter/setter', function() {
      k.store('a', 10);
      k.store('b', [1, 2, 3]);

      expect(k.store('a')).to.be.eql(10);
      expect(k.store('b')).to.be.eql([1, 2, 3]);
    });


    it('should clone arrays to avoid memory leaks', function() {
      var array = [1, 2, 3, 4, 5];

      k.store('one.array', array);
      expect(k.store('one.array')).to.be.eql(array);
      expect(k.store('one.array')).to.be.eql(array);
    });
  });


  describe('complete', function() {
    var clock;

    before(function() {
      clock = sinon.useFakeTimers();
    });

    after(function() {
      clock.restore();
    });

    it('should clean the result buffer before completing', function() {
      var spyResult = sinon.stub();
      socket.on('result', spyResult);

      setTransportTo('polling');

      // emit 40 results
      for (var i = 0; i < 40; i++) {
        k.result({id: i});
      }

      expect(spyResult).to.not.have.been.called;

      k.complete();
      expect(spyResult).to.have.been.called;
    });


    it('should navigate the client to return_url if specified', function(done) {
      windowLocation.search = '?id=567&return_url=http://return.com';
      socket = new MockSocket();
      k = new Karma(socket, {}, windowStub, windowNavigator, windowLocation);

      sinon.spy(socket, 'disconnect');

      socket.on('complete', function(data, ack) {
        ack();
      });

      k.complete();

      clock.tick(500);
      setTimeout(function() {
        expect(windowLocation.href).to.be.eql('http://return.com');
        done()
      }, 5);
      clock.tick(10)
    });

    it('should patch the console if captureConsole is true', function() {
      sinon.spy(k, 'log');
      k.config.captureConsole = true;

      var mockWindow = {
        console: {
          log: function () {}
        }
      };

      k.setupContext(mockWindow);
      mockWindow.console.log('What?');
      expect(k.log).to.have.been.calledWith('log');
      expect(k.log.args[0][1][0]).to.be.eql('What?');
    });

    it('should not patch the console if captureConsole is false', function() {
      sinon.spy(k, 'log');
      k.config.captureConsole = false;

      var mockWindow = {
        console: {
          log: function () {}
        }
      };

      k.setupContext(mockWindow);
      mockWindow.console.log('hello');
      expect(k.log).to.not.have.been.called;
    });
  });
});
