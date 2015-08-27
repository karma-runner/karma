// https://github.com/turuslan/HackTimer

var fakeIdToId = {};
onmessage = function (event) {
  var data = event.data,
    name = data.name,
    fakeId = data.fakeId,
    time;
  if(data.hasOwnProperty('time')) {
    time = data.time;
  }
  switch (name) {
    case 'setInterval':
      fakeIdToId[fakeId] = setInterval(function () {
        postMessage({fakeId: fakeId});
      }, time);
      break;
    case 'clearInterval':
      if (fakeIdToId.hasOwnProperty (fakeId)) {
        clearInterval(fakeIdToId[fakeId]);
        delete fakeIdToId[fakeId];
      }
      break;
    case 'setTimeout':
      fakeIdToId[fakeId] = setTimeout(function () {
        postMessage({fakeId: fakeId});
        if (fakeIdToId.hasOwnProperty (fakeId)) {
          delete fakeIdToId[fakeId];
        }
      }, time);
      break;
    case 'clearTimeout':
      if (fakeIdToId.hasOwnProperty (fakeId)) {
        clearTimeout(fakeIdToId[fakeId]);
        delete fakeIdToId[fakeId];
      }
      break;
  }
}