var DEFAULT_A1_TT = '09:30';
var DEFAULT_A1_AMPM = 0;
var DEFAULT_FACILITY = 2517;
var DEFAULT_PLAYER = 1;
var DEFAULT_HOLES = 18;
var DEFAULT_EMAIL = "pbateman22@hotmail.com"
var DEFAULT_PASSWORD = "Upwork9"
var COURSE_ID = 19765;
var API_KEY = "no_limits";

function $(id) {
  if (id.charAt(0) == '.') {
    return document.getElementsByClassName(id.substring(1));
  }
  return document.getElementById(id);
}

function parseTime(timeString, ampm) {
  var time = timeString.match(/^(\d\d):(\d\d)$/);
  if (!time) {
    throw 'Cannot parse: ' + timeString;
  }

  var hours = parseInt(time[1], 10);
  if (hours == 12 && ampm == 0) {
    hours = 0;
  } else {
    hours += (hours < 12 && ampm == 1)? 12 : 0;
  }
  var minutes = parseInt(time[2], 10) || 0;

  return [hours, minutes];
}

function getTimeString(hh, mm) {
  var ampm = hh >= 12 ? 'P M' : 'A M';
  hh = (hh % 12);
  if (hh == 0)
    hh = 12;
  if (mm == 0)
    mm = 'o\'clock';
  else if (mm < 10)
    mm = 'O ' + mm;

  return hh + ' ' + mm + ' ' + ampm;
}

