var a1Timer = null;
var a2Timer = null;
var port = null;
var iconFlashTimer = null;

var HOUR_MS = 1000 * 60 * 60;

function initBackground() {

  chrome.runtime.onConnect.addListener(function(popupPort) {
    port = popupPort;
    port.onDisconnect.addListener(function() {
      port = null;
    });
  });

  chrome.runtime.onInstalled.addListener(async () => {
    var date = new Date();
    var offset = -300; //Timezone offset for EST in minutes.
    var estDate = new Date(date.getTime() + offset*60*1000);
    var hh = estDate.getUTCHours();
    var mm = estDate.getUTCMinutes();
    var ss = estDate.getUTCSeconds();
  });
}

initBackground();
resetTimers();
