var a1Timer = null;
var a2Timer = null;
var port = null;
var iconFlashTimer = null;

var MINUTE_MS = 1000 * 60;
var HOUR_MS = 1000 * 60 * 60;
var LOGIN_TIME = HOUR_MS * 6;
var BOOKING_TIME = HOUR_MS * 7;
var INTERVAL_TIMES = HOUR_MS * 24;

function login() {
  var username = localStorage['email'] || DEFAULT_EMAIL;
  var password = localStorage['password'] || DEFAULT_PASSWORD;
  var api_key = API_KEY;
  var course_id = COURSE_ID;

  var data = "username=pbateman22%40hotmail.com&password=Upwork9&api_key=no_limits&course_id=19765";

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      console.log(this.responseText);
    }
  });

  xhr.open("POST", "https://foreupsoftware.com/index.php/api/booking/users/login");
  xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Cookie", "PHPSESSID=356ddkpc75li83ldntkg9j1g8d");

  xhr.send(data);
}

function booking() {

}

function setLoginTimer(timeout) {
  window.setTimeout(() => {
    setLoginIntervals();
    login();
  }, timeout);
}

function setBookingTimer(timeout) {
  window.setTimeout(() => {
    setBookingIntervals();
    booking();
  }, timeout);
}

function setLoginIntervals() {
  window.setInterval(login(), INTERVAL_TIMES);
}

function setBookingIntervals() {
  window.setInterval(booking(), INTERVAL_TIMES);
}

function initBackground() {

  chrome.runtime.onConnect.addListener(function (popupPort) {
    port = popupPort;
    port.onDisconnect.addListener(function () {
      port = null;
    });
  });

  chrome.runtime.onInstalled.addListener(async () => {
    login();
    var date = new Date();
    var offset = -300; //Timezone offset for EST in minutes.
    var estDate = new Date(date.getTime() + offset * 60 * 1000);
    var hh = estDate.getUTCHours();
    var mm = estDate.getUTCMinutes();
    var ss = estDate.getUTCSeconds();
    var now = hh * HOUR_MS + mm * MINUTE_MS + ss * 1000;
    var delta1 = LOGIN_TIME - now;

    if (delta1 < 0) {
      setLoginTimer(delta1 + INTERVAL_TIMES)
    } else {
      setLoginTimer(delta1);
    }

    var delta2 = BOOKING_TIME - now;
    if (delta2 < 0) {
      setBookingTimer(delta2 + INTERVAL_TIMES);
    } else {
      setBookingTimer(delta2);
    }

  });
}

initBackground();
resetTimers();