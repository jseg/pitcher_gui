
var	holder =	false;
var	pdata =		{
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
var	errorMsg =		false,
	mState =		0,
	connection =	new WebSocket('ws://'+location.hostname+':81/', ['arduino']);

/* var	adjustOnElems =		document.getElementsByClassName('adjust-mode-on'),
	adjustOffElems =	document.getElementsByClassName('adjust-mode-off'); */
// var	messages =	document.getElementById('message-grid');
var	msgGrid;

connection.onopen =	function() {
	connection.send('Connect '+new Date());
	
	msgGrid =	document.getElementById('message-grid');

	var	ripBtns =	document.getElementsByClassName('ripple');
	for (var i = 0; i < ripBtns.length; i++)
		mdc.ripple.MDCRipple.attachTo(ripBtns[i]);

	var	icons =	document.querySelectorAll('.icon.status');
	for (var i = 0; i < icons.length; i++)
		icons[i].innerHTML =	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 77.246 77.246"><g transform="translate(0 0)"><path class="a" d="M0,370.7l21.335-21.335,3.2,3.2L3.2,373.9Zm0,0" transform="translate(0 -296.658)"/><path class="a" d="M96.406,420.7l11.318-11.317,3.2,3.2L99.608,423.9Zm0,0" transform="translate(-81.861 -347.616)"/><path class="a" d="M17.507,320.742l3.2,3.2L9.6,335.052l-3.2-3.2Zm0,0" transform="translate(-5.433 -272.352)"/><circle class="b" cx="28.5" cy="28.5" r="28.5" transform="translate(19 1)"/><path class="a" d="M172.332,8.6a29.411,29.411,0,1,0,0,41.613,29.457,29.457,0,0,0,0-41.613Zm-38.412,3.2A24.806,24.806,0,0,1,150.8,4.537a24.883,24.883,0,0,1-.354,3.5l-2.082-.558-1.172,4.373,2.082.558a25.029,25.029,0,0,1-1.752,3.764l-1.767-1.238-2.6,3.708,1.769,1.239q-.668.79-1.406,1.531t-1.531,1.406l-1.238-1.769-3.708,2.6,1.237,1.767a24.936,24.936,0,0,1-3.763,1.752l-.558-2.081-4.373,1.172.558,2.082a24.882,24.882,0,0,1-3.5.354,24.81,24.81,0,0,1,7.269-16.883Zm-6.991,21.4a29.451,29.451,0,0,0,4.394-.486l.61,2.275,4.373-1.172-.61-2.276a29.466,29.466,0,0,0,5.193-2.42l1.351,1.929,3.708-2.6L144.6,26.537q1.1-.907,2.126-1.927t1.925-2.127l1.928,1.35,2.6-3.708-1.93-1.351a29.488,29.488,0,0,0,2.422-5.192l2.275.609,1.172-4.373-2.274-.609a29.378,29.378,0,0,0,.484-4.394,24.842,24.842,0,0,1,20.8,20.8,29.379,29.379,0,0,0-4.393.484l-.609-2.274L166.745,25l.609,2.275a29.47,29.47,0,0,0-5.192,2.422l-1.351-1.929-3.708,2.6,1.35,1.928c-.736.6-1.447,1.246-2.127,1.925s-1.32,1.39-1.925,2.127l-1.928-1.35-2.6,3.708,1.929,1.351a29.47,29.47,0,0,0-2.422,5.192l-2.274-.609L145.938,49l2.275.61a29.459,29.459,0,0,0-.484,4.394,24.844,24.844,0,0,1-20.8-20.8Zm42.2,13.809a24.806,24.806,0,0,1-16.883,7.269,24.88,24.88,0,0,1,.354-3.5l2.082.558,1.172-4.373-2.081-.558a24.966,24.966,0,0,1,1.752-3.764l1.767,1.238,2.6-3.708-1.769-1.239q.668-.79,1.406-1.531t1.53-1.406l1.238,1.769L166,35.18l-1.238-1.767a24.966,24.966,0,0,1,3.764-1.752l.557,2.081,4.373-1.172-.558-2.083a24.88,24.88,0,0,1,3.5-.354,24.809,24.809,0,0,1-7.269,16.883Zm0,0" transform="translate(-103.69 0)"/></g></svg>';

	icons =	document.querySelectorAll('.icon.status-mm');
	for (var i = 0; i < icons.length; i++)
		icons[i].innerHTML =	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 242 162.561"><g transform="translate(-3015 612)"><g transform="translate(3004 -612)"><path class="b" d="M78.762,0A78.762,78.762,0,1,1,0,78.762,78.762,78.762,0,0,1,78.762,0Z" transform="translate(52.508 2.764)" /><path class="a" d="M260.895,23.78a81.281,81.281,0,1,0,0,115,81.408,81.408,0,0,0,0-115ZM154.74,32.626A68.554,68.554,0,0,1,201.4,12.538a68.766,68.766,0,0,1-.977,9.663l-5.754-1.542-3.24,12.085,5.753,1.541a69.172,69.172,0,0,1-4.842,10.4l-4.884-3.42-7.176,10.248,4.888,3.423q-1.847,2.184-3.886,4.23t-4.23,3.884l-3.422-4.888-10.248,7.176,3.419,4.883a68.912,68.912,0,0,1-10.4,4.842l-1.541-5.751L142.77,72.551l1.542,5.754a68.762,68.762,0,0,1-9.663.979,68.563,68.563,0,0,1,20.09-46.658ZM135.42,91.772a81.389,81.389,0,0,0,12.142-1.342l1.686,6.288,12.085-3.238-1.686-6.29A81.43,81.43,0,0,0,174,80.5l3.733,5.331,10.248-7.176-3.728-5.322q3.054-2.507,5.875-5.324t5.321-5.878l5.327,3.731,7.176-10.248-5.334-3.735a81.492,81.492,0,0,0,6.694-14.349l6.287,1.684,3.238-12.085-6.285-1.684a81.187,81.187,0,0,0,1.337-12.142A68.653,68.653,0,0,1,271.367,70.79a81.192,81.192,0,0,0-12.142,1.337l-1.684-6.285L245.457,69.08l1.684,6.287a81.442,81.442,0,0,0-14.349,6.694l-3.733-5.332L218.812,83.9l3.73,5.327c-2.034,1.671-4,3.443-5.878,5.321s-3.648,3.842-5.319,5.878L206.015,96.7l-7.174,10.248,5.332,3.735a81.44,81.44,0,0,0-6.694,14.349l-6.285-1.684-3.239,12.083,6.287,1.686a81.41,81.41,0,0,0-1.339,12.142A68.657,68.657,0,0,1,135.42,91.772Zm116.63,38.163a68.554,68.554,0,0,1-46.658,20.088,68.754,68.754,0,0,1,.979-9.663l5.754,1.542,3.238-12.085-5.751-1.541a68.989,68.989,0,0,1,4.842-10.4l4.883,3.42,7.176-10.248-4.888-3.423q1.847-2.184,3.886-4.23t4.23-3.884l3.422,4.888,10.248-7.176-3.42-4.884a69,69,0,0,1,10.4-4.84l1.541,5.751,12.085-3.238-1.542-5.756a68.758,68.758,0,0,1,9.663-.977,68.561,68.561,0,0,1-20.088,46.658Zm0,0" transform="translate(-71.199 0)" /></g><rect class="a" width="29" height="12" transform="translate(3015 -537)" /><rect class="a" width="19" height="12" transform="translate(3025.34 -515.798) rotate(-7)" /><rect class="a" width="15" height="12" transform="translate(3030.787 -557.869) rotate(7)" /><rect class="a" width="29" height="12" transform="translate(3228 -537)" /><rect class="a" width="19" height="12" transform="translate(3227.802 -518.113) rotate(7)" /><rect class="a" width="15" height="12" transform="translate(3226.324 -556.041) rotate(-7)" /></g></svg>';

	icons =	document.querySelectorAll('.icon.bat');
	for (var i = 0; i < icons.length; i++)
		icons[i].innerHTML =	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68.006 68.006"><path d="M62.875,2.239A10.119,10.119,0,0,0,49.947,3.6L32.43,21.136A67.829,67.829,0,0,0,22.248,34.193a63.9,63.9,0,0,1-9.592,12.3L8.424,50.728a5.893,5.893,0,0,0-6.7,9.488l5.552,5.559a5.892,5.892,0,0,0,9.48-6.712l4.23-4.234a63.847,63.847,0,0,1,12.285-9.6A67.794,67.794,0,0,0,46.311,35.032L64.125,17.2A9.84,9.84,0,0,0,62.876,2.239Zm-38.59,36.1,4.843,4.849q-1.672,1.09-3.277,2.277L22.01,41.619q1.185-1.607,2.275-3.281Zm-7.321,9.347q1.345-1.438,2.6-2.951l3.171,3.175q-1.511,1.26-2.947,2.608Zm-2.75,2.8,2.776,2.779-2.776,2.779-2.776-2.779ZM12.826,63a1.963,1.963,0,0,1-2.776,0L4.5,57.438a1.964,1.964,0,0,1,2.776-2.779l5.552,5.559A1.965,1.965,0,0,1,12.826,63ZM61.349,14.419,43.535,32.253a63.863,63.863,0,0,1-10.986,8.8l-6.131-6.138a63.908,63.908,0,0,1,8.789-11L52.723,6.379a6.169,6.169,0,0,1,7.858-.95,5.9,5.9,0,0,1,.768,8.99Zm0,0" transform="translate(0.5 0.007)"/></svg>'+icons[i].innerHTML;
	
	icons =	document.querySelectorAll('.icon.arrow');
	for (var i = 0; i < icons.length; i++)
		icons[i].innerHTML =	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45.095 54.242"><path d="M22.547,0A8.467,8.467,0,0,0,14.09,8.457V21.886a8.658,8.658,0,0,0-11.617.324,8.463,8.463,0,0,0,0,11.958L22.547,54.242,42.621,34.168a8.463,8.463,0,0,0,0-11.958A8.652,8.652,0,0,0,31,21.886V8.457A8.467,8.467,0,0,0,22.547,0ZM19.728,35.479V8.457a2.819,2.819,0,0,1,5.638,0V35.479L34.649,26.2a2.885,2.885,0,0,1,3.986,0,2.816,2.816,0,0,1,0,3.986L22.547,46.27,6.46,30.182a2.816,2.816,0,0,1,0-3.986,2.885,2.885,0,0,1,3.986,0l9.283,9.283Z"/></svg>';
		
};
connection.onerror =	function(error) {console.log('WebSocket Error ', error);
	getElementById('status-text').innerHTML =	'Network Error'
};
connection.onmessage =	function(e) {console.log('Server: ', e.data);
	var	m =	JSON.parse(e.data);

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

			errorMsg =	true;
		}
	}

};
connection.onclose =	function() {
	console.log('WebSocket connection closed');
};

function clearUI() {
	msgGrid.classList =	[];
	msgGrid.classList.add('hidden');

	// document.getElementById('pitch-text').innerHTML = '';
	// document.getElementById('speed-text').innerHTML = '';
	// document.getElementById('hand-text').innerHTML = '';

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

	/* for (var i = 0; i < adjustOnElems.length; i++)
		adjustOnElems[i].classList.add('hidden'); */

	/* document.getElementById('s60').classList.add('speed-locked');
	document.getElementById('s65').classList.add('speed-locked');
	document.getElementById('s70').classList.add('speed-locked');
	document.getElementById('s75').classList.add('speed-locked');
	document.getElementById('s80').classList.add('speed-locked');
	document.getElementById('s85').classList.add('speed-locked');
	document.getElementById('s90').classList.add('speed-locked');
	document.getElementById('s95').classList.add('speed-locked'); */
	/* for (var i = 0; i < 7; i++) {
		document.getElementById('s'+String(60 + (i * 5))).classList.add('speed-locked');
	} */
	// document.getElementById('speed-grid').classList.add('hidden');

	/* for (var i = 0; i < adjustOffElems.length; i++)
		adjustOffElems[i].classList.add('hidden'); */

	document.getElementById('fire').classList.add('locked');
}

var	statusIcon0;
function drawStatus(n) {
	switch(n) {
		case 1:
			// document.getElementById('status-text').innerHTML =	'Loading...';
						
			document.getElementById('state-text').innerHTML =	'Loading...';
			break;
		case 2:
			if (pdata._state > 10) {
				document.getElementById('status-text').innerHTML =	'Aiming...';//TODO? temporarily disable [some] butons?
			} else {
				// document.getElementById('status-text').innerHTML =	'Aim Pitch';
				
				var	statusIcon =	[],
					statusText =	'';
				if (pdata._keyedPreset < 4) {
					statusIcon.push('top');
					statusText =	'High ';
				} else if (pdata._keyedPreset > 6) {
					statusIcon.push('bottom');
					statusText =	'Low ';
				} else {
					statusText =	'Mid ';
				}
				switch (pdata._keyedPreset % 3) {
					case 1 :
						statusIcon.push('left');
						statusText +=	(!pdata._hand ? 'Inside' : 'Outside');
					break;
					case 2 :
						statusText +=	'Mid';
					break;
					case 0 :
						statusIcon.push('right');
						statusText +=	(!pdata._hand ? 'Outside' : 'Inside');
					break;
				}

				if (statusIcon0)
					document.getElementById('status-icon').classList.remove(statusIcon0);
				statusIcon =	(statusIcon.length ? statusIcon.join('-') : 'center');
				document.getElementById('status-icon').classList.add(statusIcon);
				statusIcon0 =	statusIcon;
				document.getElementById('status-text').innerHTML =	statusText;
			}
			break;
		case 3:
			// document.getElementById('status-text').innerHTML =	'Ready to Fire';
			break;
		case 4:
			// document.getElementById('status-text').innerHTML =	'Firing';
						
			document.getElementById('state-text').innerHTML =	'Firing';
			break;
	}
	
	switch(n) {
		case 1:
		case 4:
			document.getElementById('status-icon-2').classList =	document.getElementById('status-icon').classList;
			document.getElementById('status-text-2').innerHTML =	document.getElementById('status-text').innerHTML;
			document.getElementById('message-text').innerHTML =		'Speed<br/>'+pdata._speed;
			
			msgGrid.classList =	[];
			msgGrid.classList.add('firing');
			if (n == 1)
				msgGrid.classList.add('loading');
			if (pdata._repeat)
				msgGrid.classList.add('repeat');
		break;
	}

}

function drawKeyPad() {
	// document.getElementById('hand-text').innerHTML = 'Choose a Hand';
	if (pdata._nudge > 0) {
		// document.getElementById('pitch-text').innerHTML = 'Pitch: '+pdata._pitch+' Yaw: '+pdata._yaw+' Spring: '+pdata._spring;
		// document.getElementById('pitch-text').innerHTML = '';
		document.getElementById('status-pitch').innerHTML =		pdata._pitch;
		document.getElementById('status-yaw').innerHTML =		pdata._yaw;
		document.getElementById('status-spring').innerHTML =	pdata._spring;
	} else {
		// document.getElementById('pitch-text').innerHTML = 'Choose a Pitch';
	}
	// document.getElementById('speed-text').innerHTML = 'Choose a Speed';

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

		/* for (var i = 0; i < adjustOnElems.length; i++)
			adjustOnElems[i].classList.remove('hidden'); */
		document.getElementById('root-grid').classList.add('adjust-mode');

		/* document.getElementById('save').classList.add('nudge-S');
		document.getElementById('default').classList.add('nudge-S');
		document.getElementById('nudge-top').classList.add('nudge-V');
		document.getElementById('nudge-left').classList.add('nudge-H');
		document.getElementById('nudge-right').classList.add('nudge-H');
		document.getElementById('nudge-bottom').classList.add('nudge-V');
		document.getElementById('nudge-splus').classList.add('nudge-S');
		document.getElementById('nudge-sminus').classList.add('nudge-S'); */
	} else {
		/* for (var i = 0; i < adjustOffElems.length; i++)
			adjustOffElems[i].classList.remove('hidden'); */
		document.getElementById('root-grid').classList.remove('adjust-mode');
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
	// document.getElementById('speed-grid').classList.remove('hidden');
	for (var i = 0; i < 7; i++) {
		// document.getElementById('s'+String(60 + (i * 5))).classList.remove('speed-locked');
		document.getElementById('s'+String(60 + (i * 5))).classList.remove('selected');
	}
	document.getElementById('s'+String(pdata._speed)).classList.add('selected');

	document.getElementById('repeat').classList.remove('locked');
}

function drawFire() {
	document.getElementById('fire').classList.remove('locked');
	document.getElementById('fire').classList.remove('selected');
	if (pdata._repeat == 0)
		pdata._fire =	0;
}

function hand(n) {
	if (!n) {
		document.getElementById('left').classList.add('selected');
		document.getElementById('right').classList.remove('selected');
		/* document.getElementById('p1').innerHTML = 'High Outside';
		document.getElementById('p3').innerHTML = 'High Inside';
		document.getElementById('p4').innerHTML = 'Mid Outside';
		document.getElementById('p6').innerHTML = 'Mid Inside';
		document.getElementById('p7').innerHTML = 'Low Outside';
		document.getElementById('p9').innerHTML = 'Low Inside'; */
		document.getElementById('status-icon').classList.add('left-hand');
		document.getElementById('status-icon').classList.remove('right-hand');

		// pdata._hand =	0;
	} else {
		document.getElementById('left').classList.remove('selected');
		document.getElementById('right').classList.add('selected');
		/* document.getElementById('p1').innerHTML = 'High Inside';
		document.getElementById('p3').innerHTML = 'High Outside';
		document.getElementById('p4').innerHTML = 'Mid Inside';
		document.getElementById('p6').innerHTML = 'Mid Outside';
		document.getElementById('p7').innerHTML = 'Low Inside';
		document.getElementById('p9').innerHTML = 'Low Outside'; */
		document.getElementById('status-icon').classList.add('right-hand');
		document.getElementById('status-icon').classList.remove('left-hand');

		// pdata._hand =	1;
	}
	pdata._hand =		n;
	pdata._command =	1;

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;

	drawStatus(2);
}

function preset(n) {
	if (pdata._state <= 0) return;

	/* for (var i = 1; i < 10; i++)
		document.getElementById('p'+String(i)).classList.remove('selected'); */
	document.getElementById('p'+String(pdata._keyedPreset)).classList.remove('selected');
	document.getElementById('p'+String(n)).classList.add('selected');

	pdata._keyedPreset =	n;
	pdata._keyed =			1;
	pdata._command =		2;

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;

	drawStatus(2);
}

function sendSpeed(t) {
	// preventDefault();
	/* for (var i = 0; i < 7; i++)
		document.getElementById('s'+String(60 + (i * 5))).classList.remove('selected'); */
	document.getElementById('s'+String(pdata._speed)).classList.remove('selected');
	document.getElementById('s'+String(t)).classList.add('selected');

	pdata._speed =		t;
	pdata._fire =		0;
	pdata._command =	3;

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;

	/* var	speedstr = 'speed '+String(speed);
	document.getElementById('sliderVal').innerHTML = t.value;
	connection.send(speedstr);
	console.log(speedstr); */
}

function fire() {
	if (pdata._state <= 0) return;

	document.getElementById('fire').classList.add('selected');

	pdata._fire =		1;
	pdata._command =	3;

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;
}

function nudged(n) {
	if (pdata._state <= 0) return;

	/* switch(n) {
		case 0: pdata._command = 6; break;
		case 1: pdata._command = 7; break;
		case 2: pdata._command = 8; break;
		case 3: pdata._command = 9; break;
		case 4: pdata._command = 10; break;
		case 5: pdata._command = 11; break;
	} */
	if ((0 <= n) && (n <= 5))
		pdata._command =	(6 + n);

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;
}

function save() {
	if (pdata._state <= 0) return;

	pdata._command =	12;

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;
}

function factory() {
	if (pdata._state <= 0) return;

	pdata._command =	13;

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;
}

function repeater(t) {
	// var	rep = document.getElementById('repeat').value;
	// if (t.children[0].innerHTML == 'Repeat') {
	if (!pdata._repeat) {
		// t.children[0].innerHTML =	'Stop';
		t.classList.add('selected');

		pdata._repeat =	1;
	} else {
		// t.children[0].innerHTML =	'Repeat';
		t.classList.remove('selected');

		pdata._repeat =	0;
	}
	pdata._fire =		0;
	pdata._command =	4;

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;
}

function handleError(n) {
	// var i;
	pdata._errorCode =	n;
	pdata._command =	5;

	connection.send(JSON.stringify(pdata));
	pdata._command =	0;

	errorMsg =	false;
}


function errorAlerts(n) {
	switch(n) {
		case 1:
			/* swal({
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
			}); */
			
			document.getElementById('state-text').innerHTML =	'Ball Jam';
			document.getElementById('message-text').innerHTML =	'Please,<br/>open the access door and remove the ball';

			msgGrid.classList =	[];
			msgGrid.classList.add('jam');
		break;
	}
}

function jamProgress(n) {
	switch(n) {
		case 1:
			document.getElementById('state-text').innerHTML =	'Thanks,<br/>for clearing that sport!';
			document.getElementById('message-text').innerHTML =	'';

			msgGrid.classList =	[];
			msgGrid.classList.add('cleared');
		break;
		case 2:
			handleError(1);

			msgGrid.classList =	[];
			msgGrid.classList.add('hidden');
		break;
	}
}