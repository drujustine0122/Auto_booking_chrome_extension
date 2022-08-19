// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var blankClockImage;
var blankClockAnim1Image;
var blankClockAnim2Image;
var animationTimer;
var currentClockImage;
var port;

function loadAllImages() {
  var loadCount = 0;
  var img = new Image();
  img.onload = function() {
    blankClockImage = img;
    currentClockImage = blankClockImage;
    drawClock();
  };
  img.src = 'blank-clock-150.png';

  // These will finish loading before they're needed, no need
  // for an onload handler.
  blankClockAnim1Image = new Image();
  blankClockAnim1Image.src = 'blank-clock-ring1-150.png';
  blankClockAnim2Image = new Image();
  blankClockAnim2Image.src = 'blank-clock-ring2-150.png';
}

function drawClock(hh, mm, ss) {
  if (hh == undefined || mm == undefined) {
    var d = new Date();
    hh = d.getHours();
    mm = d.getMinutes();
    ss = d.getSeconds() + 0.001 * d.getMilliseconds();
  }

  if (!currentClockImage) {
    loadAllImages();
    return;
  }

  var ctx = $('clock').getContext('2d');
  ctx.drawImage(currentClockImage, 0, 0);

  // Move the hour by the fraction of the minute
  hh = (hh % 12) + (mm / 60);

  // Move the minute by the fraction of the second
  mm += (ss / 60);

  var hourAngle = Math.PI * hh / 6;
  var hourX = Math.sin(hourAngle);
  var hourY = -Math.cos(hourAngle);
  var minAngle = Math.PI * mm / 30;
  var minX = Math.sin(minAngle);
  var minY = -Math.cos(minAngle);
  var secAngle = Math.PI * ss / 30;
  var secX = Math.sin(secAngle);
  var secY = -Math.cos(secAngle);

  var cx = 75;
  var cy = 77;

  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ffffff';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * hourX, cy - 4 * hourY);
  ctx.lineTo(cx + 20 * hourX, cy + 20 * hourY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 8 * minX, cy - 8 * minY);
  ctx.lineTo(cx + 35 * minX, cy + 33 * minY);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#696969';
  ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * hourX, cy - 4 * hourY);
  ctx.lineTo(cx + 20 * hourX, cy + 20 * hourY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 8 * minX, cy - 8 * minY);
  ctx.lineTo(cx + 35 * minX, cy + 33 * minY);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#990000';
  ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * secX, cy - 4 * secY);
  ctx.lineTo(cx + 40 * secX, cy + 40 * secY);
  ctx.stroke();
}

function updateCurrentTime() {
  var date = new Date();
  var offset = -300; //Timezone offset for EST in minutes.
  var estDate = new Date(date.getTime() + offset*60*1000);
  var hh = estDate.getUTCHours();
  var mm = estDate.getUTCMinutes();
  var ss = estDate.getUTCSeconds();
  var str = '';
  if (hh % 12 == 0) {
    str += '12';
  } else {
    str += (hh % 12);
  }
  str += ':';
  if (mm >= 10) {
    str += mm;
  } else {
    str += '0' + mm;
  }
  str += ':';
  if (ss >= 10) {
    str += ss;
  } else {
    str += '0' + ss;
  }
  if (hh >= 12) {
    str += " PM";
  } else {
    str += " AM";
  }
  $('current_time').innerText = str;
}


function addOutlineStyleListeners() {
  document.addEventListener('click', function(evt) {
    document.body.classList.add('nooutline');
    return true;
  }, true);
  document.addEventListener('keydown', function(evt) {
    document.body.classList.remove('nooutline');
    return true;
  }, true);
}

function load() {
  try {
    port = chrome.runtime.connect();
    port.onMessage.addListener(function(msg) {
      if (msg.cmd == 'anim') {
        displayAlarmAnimation();
      }
    });
  } catch (e) {
  }

  addOutlineStyleListeners();

  drawClock();
  setInterval(drawClock, 100);

  updateCurrentTime();
  setInterval(updateCurrentTime, 250);

  function updateTime(timeElement) {
    if (!parseTime(timeElement.value)) {
      return false;
    }

    timeElement.valueAsNumber =
        timeElement.valueAsNumber % (12 * 60 * 60 * 1000);
    if (timeElement.valueAsNumber < (1 * 60 * 60 * 1000))
      timeElement.valueAsNumber += (12 * 60 * 60 * 1000);
    return true;
  }

  // Alarm 1

  var a1_tt = localStorage['a1_tt'] || DEFAULT_A1_TT;
  $('a1_tt').value = a1_tt;
  $('a1_tt').addEventListener('input', function(evt) {
    if (!updateTime($('a1_tt'))) {
      evt.stopPropagation();
      return false;
    }
    localStorage['a1_tt'] = $('a1_tt').value;
    return true;
  }, false);
  $('a1_tt').addEventListener('change', function(evt) {
    if ($('a1_tt').value.length == 4 &&
        parseTime('0' + $('a1_tt').value)) {
      $('a1_tt').value = '0' + $('a1_tt').value;
    }
    if (!updateTime($('a1_tt'))) {
      evt.stopPropagation();
      return false;
    }
    localStorage['a1_tt'] = $('a1_tt').value;
    return true;
  }, false);

  var a1_ampm = localStorage['a1_ampm'] || DEFAULT_A1_AMPM;
  $('a1_ampm').selectedIndex = a1_ampm;
  $('a1_ampm').addEventListener('change', function(evt) {
    localStorage['a1_ampm'] = $('a1_ampm').selectedIndex;
  }, false);


  // Facility

  var facility = localStorage['facility'] || DEFAULT_FACILITY;
  $('facility').value = facility;

  $('facility').addEventListener('change', function(evt) {
    localStorage['facility'] = $('facility').value;
  }, false);
  
  var player = localStorage['player'] || DEFAULT_PLAYER;
  $('player'+player).classList.add("active");

  $('player1').addEventListener('click', function(evt) {
    var player_num = localStorage['player'] || DEFAULT_PLAYER;
    $('player'+player_num).classList.remove("active");
    localStorage['player'] = 1;
    $('player1').classList.add("active");
  }, false);
  
  $('player2').addEventListener('click', function(evt) {
    var player_num = localStorage['player'] || DEFAULT_PLAYER;
    $('player'+player_num).classList.remove("active");
    localStorage['player'] = 2;
    $('player2').classList.add("active");
  }, false);

  $('player3').addEventListener('click', function(evt) {
    var player_num = localStorage['player'] || DEFAULT_PLAYER;
    $('player'+player_num).classList.remove("active");
    localStorage['player'] = 3;
    $('player3').classList.add("active");
  }, false);

  $('player4').addEventListener('click', function(evt) {
    var player_num = localStorage['player'] || DEFAULT_PLAYER;
    $('player'+player_num).classList.remove("active");
    localStorage['player'] = 4;
    $('player4').classList.add("active");
  }, false);


  var holes = localStorage['holes'] || DEFAULT_HOLES;
  $('holes').value = holes;
  $('holes').addEventListener('change', function(evt) {
    localStorage['holes'] = $('holes').value;
  }, false);

  var email = localStorage['email'] || DEFAULT_EMAIL;
  $('email').value = email;
  $('email').addEventListener('change', function(evt) {
    localStorage['email'] = $('email').value;
  }, false);

  var password = localStorage['password'] || DEFAULT_PASSWORD;
  $('password').value = password;
  $('password').addEventListener('change', function(evt) {
    localStorage['password'] = $('password').value;
  }, false);

 }

document.addEventListener('DOMContentLoaded', load);
