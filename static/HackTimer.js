//https://github.com/turuslan/HackTimer

(function (workerScript) {
  try {
    var blob = new Blob (["\
var fakeIdToId = {};\
onmessage = function (event) {\
	var data = event.data,\
		name = data.name,\
		fakeId = data.fakeId,\
		time;\
	if(data.hasOwnProperty('time')) {\
		time = data.time;\
	}\
	switch (name) {\
		case 'setInterval':\
			fakeIdToId[fakeId] = setInterval(function () {\
				postMessage({fakeId: fakeId});\
			}, time);\
			break;\
		case 'clearInterval':\
			if (fakeIdToId.hasOwnProperty (fakeId)) {\
				clearInterval(fakeIdToId[fakeId]);\
				delete fakeIdToId[fakeId];\
			}\
			break;\
		case 'setTimeout':\
			fakeIdToId[fakeId] = setTimeout(function () {\
				postMessage({fakeId: fakeId});\
				if (fakeIdToId.hasOwnProperty (fakeId)) {\
					delete fakeIdToId[fakeId];\
				}\
			}, time);\
			break;\
		case 'clearTimeout':\
			if (fakeIdToId.hasOwnProperty (fakeId)) {\
				clearTimeout(fakeIdToId[fakeId]);\
				delete fakeIdToId[fakeId];\
			}\
			break;\
	}\
}\
"]);
    // Obtain a blob URL reference to our worker 'file'.
    workerScript = window.URL.createObjectURL(blob);
  } catch (error) {
    /* Blob is not supported, use external script instead */
  }
  var worker,
    fakeIdToCallback = {},
    lastFakeId = 0,
    logPrefix = 'HackTimer.js by turuslan: ';
  if (typeof (Worker) !== 'undefined') {
    function getFakeId () {
      lastFakeId ++;
      return lastFakeId;
    }
    try {
      worker = new Worker (workerScript);
      window.setInterval = function (callback, time /* , parameters */) {
        var fakeId = getFakeId ();
        fakeIdToCallback[fakeId] = {
          callback: callback,
          parameters: Array.prototype.slice.call(arguments, 2)
        };
        worker.postMessage ({
          name: 'setInterval',
          fakeId: fakeId,
          time: time
        });
        return fakeId;
      };
      window.clearInterval = function (fakeId) {
        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          delete fakeIdToCallback[fakeId];
          worker.postMessage ({
            name: 'clearInterval',
            fakeId: fakeId
          });
        }
      };
      window.setTimeout = function (callback, time /* , parameters */) {
        var fakeId = getFakeId ();
        fakeIdToCallback[fakeId] = {
          callback: callback,
          parameters: Array.prototype.slice.call(arguments, 2)
        };
        worker.postMessage ({
          name: 'setTimeout',
          fakeId: fakeId,
          time: time
        });
        return fakeId;
      };
      window.clearTimeout = function (fakeId) {
        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          delete fakeIdToCallback[fakeId];
          worker.postMessage ({
            name: 'clearTimeout',
            fakeId: fakeId
          });
        }
      };
      worker.onmessage = function (event) {
        var data = event.data,
          fakeId = data.fakeId,
          request,
          parameters,
          callback;
        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          request = fakeIdToCallback[fakeId];
          callback = request.callback;
          parameters = request.parameters;
        }
        if (typeof (callback) === 'string') {
          try {
            callback = new Function (callback);
          } catch (error) {
            console.log (logPrefix + 'Error parsing callback code string: ', error);
          }
        }
        if (typeof (callback) === 'function') {
          callback.apply (window, parameters);
        }
      };
      worker.onerror = function (event) {
        console.log (event);
      };
      console.log (logPrefix + 'Initialisation succeeded');
    } catch (error) {
      console.log (logPrefix + 'Initialisation failed');
      console.error (error);
    }
  } else {
    console.log (logPrefix + 'Initialisation failed - HTML5 Web Worker is not supported');
  }
}) ('HackTimerWorker.js');
