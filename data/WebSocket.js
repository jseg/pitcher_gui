
var holder = false;
var pdata = {
	_state: 0,
	_hand: 1,
	_keyed: 0,
	_repeat: 0,
	_keyedPreset: 5,
	_currentPreset: 5,
	_speed: 80,
	_fire: 0,
	_totalError: 0,
	_command: 0,
	_nudge: 0,
	_pitch: 0,
	_yaw: 0,
	_spring: 0
};
var errorMsg = false;
var mState = 0;
var connection = new WebSocket('ws://'+location.hostname+':81/', ['arduino']);

var adjustElems = document.getElementsByClassName('adjust-mode');


connection.onopen = function() {
	connection.send('Connect ' + new Date());
};
connection.onerror = function(error) {console.log('WebSocket Error ', error);
	getElementById('status').innerHTML = 'Network Error'
};
connection.onmessage = function(e) {console.log('Server: ', e.data);
	var m = JSON.parse(e.data);

	pdata._state =			m._state;
	pdata._hand =			m._hand;
	pdata._keyed =			m._keyed;
	pdata._repeat =			m._repeat;
	pdata._keyedPreset =	m._keyedPreset;
	pdata._currentPreset =	m._currentPreset;
	pdata._speed =			m._speed;
	pdata._fire =			m._fire;
	pdata._totalError =		m._totalError;
	pdata._errorCode =		m._errorCode;
	pdata._nudge =			m._nudge;
	pdata._pitch =			m._pitch;
	pdata._yaw =			m._yaw;
	pdata._spring =			m._spring;

	clearUI();
	switch(m._state) {
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
		case 8:
			drawStatus(1); //Loading...
		break;
		case 9:
		case 10:
		case 11:
			drawStatus(2); //Aim Pitch or Aiming
			drawKeyPad();
		break;
		case 12:
			drawStatus(3); //Ready to Fire
			drawKeyPad();
			drawFire();
			//pdata.state = 1;
		break;
		case 13:
		case 14:
		case 15:
		case 16:
			drawStatus(4); //Firing
		break;
	}
	if (m._errorCode > 0) {
		if (!errorMsg) { //Show once
			errorAlerts(m._errorCode);
			errorMsg = true;
		}
	}

};
connection.onclose = function() {
	console.log('WebSocket connection closed');
};

function clearUI() {
	document.getElementById('pitch-text').innerHTML = '';
	document.getElementById('speed-text').innerHTML = '';
	document.getElementById('hand-text').innerHTML = '';

	document.getElementById('left').classList.add('locked');
	document.getElementById('right').classList.add('locked');

	/* for (var i = 1; i < 10; i++) {
		document.getElementById('p'+String(i)).classList.add('locked');
	} */
	document.getElementById('aim-grid').classList.add('hidden');
	/* document.getElementById('save').classList.add('locked');
	document.getElementById('default').classList.add('locked');
	document.getElementById('nudge-top').classList.add('locked');
	document.getElementById('nudge-left').classList.add('locked');
	document.getElementById('nudge-right').classList.add('locked');
	document.getElementById('nudge-bottom').classList.add('locked');
	document.getElementById('nudge-splus').classList.add('locked');
	document.getElementById('nudge-sminus').classList.add('locked'); */
	for (var i = 0; i < adjustElems.length; i++)
		adjustElems[i].classList.add('hidden');

	/* document.getElementById('s60').classList.add('speed-locked');
	document.getElementById('s65').classList.add('speed-locked');
	document.getElementById('s70').classList.add('speed-locked');
	document.getElementById('s75').classList.add('speed-locked');
	document.getElementById('s80').classList.add('speed-locked');
	document.getElementById('s85').classList.add('speed-locked');
	document.getElementById('s90').classList.add('speed-locked');
	document.getElementById('s95').classList.add('speed-locked'); */
	/* for (var i = 0; i < 7; i++) {
		document.getElementById('s'+String( 60 + (i * 5))).classList.add('speed-locked');
	} */
	document.getElementById('speed-strip').classList.add('hidden');
	document.getElementById('fire').classList.add('locked');
}

function drawStatus(n) {
	switch(n) {
		case 1:
			document.getElementById('status').innerHTML = 'Loading...';
			break;
		case 2:
			if (pdata._state > 10) {
				document.getElementById('status').innerHTML = 'Aiming...';
			}
			else {
				document.getElementById('status').innerHTML = 'Aim Pitch';
			}
			break;
		case 3:
			document.getElementById('status').innerHTML = 'Ready to Fire';
			break;
		case 4:
			document.getElementById('status').innerHTML = 'Firing';
			break;
	}

}

function drawKeyPad() {
	document.getElementById('hand-text').innerHTML = 'Choose a Hand';
	if (pdata._nudge > 0) {
		// document.getElementById('pitch-text').innerHTML = ('Pitch: '+pdata._pitch+' Yaw: '+pdata._yaw+' Spring: '+pdata._spring);
		document.getElementById('pitch-text').innerHTML = '';
		document.getElementById('status-pitch').innerHTML = pdata._pitch;
		document.getElementById('status-yaw').innerHTML = pdata._yaw;
		document.getElementById('status-spring').innerHTML = pdata._spring;
	} else {
		document.getElementById('pitch-text').innerHTML = 'Choose a Pitch';
	}
	document.getElementById('speed-text').innerHTML = 'Choose a Speed';

	document.getElementById('left').classList.remove('locked');
	document.getElementById('right').classList.remove('locked');

	if (pdata._hand == 1) {
		document.getElementById('left').classList.remove('selected');
		document.getElementById('right').classList.add('selected');
	} else {
		document.getElementById('left').classList.add('selected');
		document.getElementById('right').classList.remove('selected');
	}
	if (pdata._nudge > 0) {
		/* document.getElementById('save').classList.remove('locked');
		document.getElementById('default').classList.remove('locked');
		document.getElementById('nudge-top').classList.remove('locked');
		document.getElementById('nudge-left').classList.remove('locked');
		document.getElementById('nudge-right').classList.remove('locked');
		document.getElementById('nudge-bottom').classList.remove('locked');
		document.getElementById('nudge-splus').classList.remove('locked');
		document.getElementById('nudge-sminus').classList.remove('locked'); */
		for (var i = 0; i < adjustElems.length; i++)
			adjustElems[i].classList.remove('hidden');

		document.getElementById('save').classList.add('nudge-S');
		document.getElementById('default').classList.add('nudge-S');
		document.getElementById('nudge-top').classList.add('nudge-V');
		document.getElementById('nudge-left').classList.add('nudge-H');
		document.getElementById('nudge-right').classList.add('nudge-H');
		document.getElementById('nudge-bottom').classList.add('nudge-V');
		document.getElementById('nudge-splus').classList.add('nudge-S');
		document.getElementById('nudge-sminus').classList.add('nudge-S');
	}
	document.getElementById('aim-grid').classList.remove('hidden');
	for (var i = 1; i < 10; i++) {
		// document.getElementById('p'+String(i)).classList.remove('locked');

		document.getElementById('p'+String(i)).classList.remove('selected');
	}
	document.getElementById('p'+String(pdata._currentPreset)).classList.add('selected');

	/* document.getElementById('s60').classList.remove('speed-selected');
	document.getElementById('s65').classList.remove('speed-selected');
	document.getElementById('s70').classList.remove('speed-selected');
	document.getElementById('s75').classList.remove('speed-selected');
	document.getElementById('s80').classList.remove('speed-selected');
	document.getElementById('s85').classList.remove('speed-selected');
	document.getElementById('s90').classList.remove('speed-selected');
	document.getElementById('s95').classList.remove('speed-selected'); */
	document.getElementById('speed-strip').classList.remove('hidden');
	for (var i = 0; i < 7; i++) {
		// document.getElementById('s'+String( 60 + (i * 5))).classList.remove('speed-locked');

		document.getElementById('s'+String( 60 + (i * 5))).classList.remove('speed-selected');
	}
	document.getElementById('s'+String(pdata._speed)).classList.add('speed-selected');

	document.getElementById('repeat').classList.remove('locked');
}

function drawFire() {
	document.getElementById('fire').classList.remove('selected');
	if (pdata._repeat == 0) {
		pdata._fire = 0;
	}
}

function hand(n) {
	if (n<1) {
		document.getElementById('left').classList.add('selected');
		document.getElementById('right').classList.remove('selected');
		/* document.getElementById('p1').innerHTML = 'High Outside';
		document.getElementById('p3').innerHTML = 'High Inside';
		document.getElementById('p4').innerHTML = 'Mid Outside';
		document.getElementById('p6').innerHTML = 'Mid Inside';
		document.getElementById('p7').innerHTML = 'Low Outside';
		document.getElementById('p9').innerHTML = 'Low Inside'; */
		document.getElementById('yaw-adjust').classList.add('left-hand');
		document.getElementById('yaw-adjust').classList.remove('right-hand');

		pdata._hand = 0;
	} else {
		document.getElementById('left').classList.remove('selected');
		document.getElementById('right').classList.add('selected');
		/* document.getElementById('p1').innerHTML = 'High Inside';
		document.getElementById('p3').innerHTML = 'High Outside';
		document.getElementById('p4').innerHTML = 'Mid Inside';
		document.getElementById('p6').innerHTML = 'Mid Outside';
		document.getElementById('p7').innerHTML = 'Low Inside';
		document.getElementById('p9').innerHTML = 'Low Outside'; */
		document.getElementById('yaw-adjust').classList.add('right-hand');
		document.getElementById('yaw-adjust').classList.remove('left-hand');

		pdata._hand = 1;
	}
	pdata._command = 1;
	connection.send(JSON.stringify(pdata));
	pdata._command = 0;
}

function preset(n) {
	if (pdata._state > 0) {
		for (var i = 1; i < 10; i++) {
			document.getElementById('p'+String(i)).classList.remove('selected');
		}
		document.getElementById('p'+String(n)).classList.add('selected');

		pdata._keyedPreset = n;
		pdata._keyed = 1;
		pdata._command = 2;
		connection.send(JSON.stringify(pdata));
		pdata._command = 0;
		drawStatus(2);
	}
}

function sendSpeed(t) {
	// preventDefault();
	pdata._speed = t;
	pdata._fire = 0;
	for (var i = 0; i < 7; i++) {
		document.getElementById('s'+String( 60 + (i * 5))).classList.remove('speed-selected');
	}
	document.getElementById('s'+String(t)).classList.add('speed-selected');
	pdata._command = 3;
	connection.send(JSON.stringify(pdata));
	pdata._command = 0;
	//var speedstr = 'speed ' + String(speed);
	// document.getElementById('sliderVal').innerHTML = t.value;
	// connection.send(speedstr);
	// console.log(speedstr);
}

function fire() {
	if (pdata._state > 0) {
		pdata._fire = 1;
		pdata._command = 3;
		document.getElementById('fire').classList.remove('locked');

		document.getElementById('fire').classList.add('selected');
		connection.send(JSON.stringify(pdata));
		pdata._command = 0;
	}
}

function nudged(n) {
	if (pdata._state > 0) {
		/* switch(n) {
			case 0: pdata._command = 6; break;
			case 1: pdata._command = 7; break;
			case 2: pdata._command = 8; break;
			case 3: pdata._command = 9; break;
			case 4: pdata._command = 10; break;
			case 5: pdata._command = 11; break;
		} */
		if (0 <= n && n <= 5) {
			pdata._command = (6 + n);
		}
		connection.send(JSON.stringify(pdata));
		pdata._command = 0;
	}
}

function save() {
	if (pdata._state > 0) {
		pdata._command = 12;
		connection.send(JSON.stringify(pdata));
		pdata._command = 0;
	}
}

function factory() {
	if (pdata._state > 0) {
		pdata._command = 13;
		connection.send(JSON.stringify(pdata));
		pdata._command = 0;
	}
}

function repeater(t) {
	var rep = document.getElementById('repeat').value;
	if (t.innerHTML == 'Repeat') {
		t.innerHTML = 'Stop';
		t.classList.add('selected');
		pdata._repeat = 1;
	} else {
		t.innerHTML = 'Repeat';
		t.classList.remove('selected');
		pdata._repeat = 0;
	}
	pdata._fire = 0;
	pdata._command = 4;
	connection.send(JSON.stringify(pdata));
	pdata._command = 0;
}

function handleError(n) {
	var i;
	pdata._errorCode = n;
	pdata._command = 5;
	connection.send(JSON.stringify(pdata));
	pdata._command = 0;
	errorMsg = false;
}


function errorAlerts(n) {
	switch(n) {
		case 1:
			swal({
				title: "Ball Jam!",
				text: "Please open the access door and remove the ball",
				buttons: {
					confirm: {
						text: "Jam Cleared",
						value: "clear",
					},
					// default: true,
				},
				icon: "error",
				dangerMode: true,

			})
			.then((value) => {
				switch (value) {
					case "clear":
						handleError(1);
					break;
					default:
						swal('Clear the f-ing jam');
					break;
				}
			});
		break;
	}
}
