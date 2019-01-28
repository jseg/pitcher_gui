
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
    _command: 0
};
var errorMsg = false;
var mState = 0;
var connection = new WebSocket('ws://'+location.hostname+':81/', ['arduino']);



connection.onopen = function () {
    connection.send('Connect ' + new Date());
};
connection.onerror = function (error) {
    getElementById("status").innerHTML = "Network Error"
    console.log('WebSocket Error ', error);
};
connection.onmessage = function (e) {  
    console.log('Server: ', e.data);
    var m = JSON.parse(e.data);
    pdata._state = m._state;
    pdata._hand = m._hand;
    pdata._keyed = m._keyed;
    pdata._repeat = m._repeat;
    pdata._keyedPreset = m._keyedPreset;
    pdata._currentPreset = m._currentPreset;
    pdata._speed = m._speed;
    pdata._fire = m._fire;
    pdata._totalError = m._totalError;
    pdata._errorCode = m._errorCode;
    clearUI();
    switch(m._state){
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
    if (m._errorCode > 0){
        if(!errorMsg){ //Show once
            errorAlerts(m._errorCode);
            errorMsg = true;
        }
    }

};
connection.onclose = function(){
    console.log('WebSocket connection closed');
};

function clearUI(){
    document.getElementById("pitch_text").innerHTML = " ";
    document.getElementById("speed_text").innerHTML = " ";
    document.getElementById("hand_text").innerHTML = " ";
    document.getElementById('left').className = 'locked';
    document.getElementById('right').className = 'locked';
    
    for (i = 1; i < 10; i++) { 
        document.getElementById('p'+String(i)).className = 'locked';      
    }
    
    document.getElementById('s60').className = 'speedlocked';
    document.getElementById('s65').className = 'speedlocked';
    document.getElementById('s70').className = 'speedlocked';
    document.getElementById('s75').className = 'speedlocked';
    document.getElementById('s80').className = 'speedlocked';
    document.getElementById('s85').className = 'speedlocked';
    document.getElementById('s90').className = 'speedlocked';
    document.getElementById('s95').className = 'speedlocked';
    document.getElementById('fire').className = 'locked';
}

function drawStatus(n){
    switch(n){
        case 1:
            document.getElementById("status").innerHTML = "Loading...";
            break;
        case 2:
            if (pdata._state > 10){
                document.getElementById("status").innerHTML = "Aiming...";
            }
            else {
                document.getElementById("status").innerHTML = "Aim Pitch";
            }
            break;
        case 3:
            document.getElementById("status").innerHTML = "Ready to Fire";
            break;
        case 4:
            document.getElementById("status").innerHTML = "Firing";
            break;
    }

}

function drawKeyPad(){
    document.getElementById("hand_text").innerHTML = "Choose a Hand";
    document.getElementById("pitch_text").innerHTML = "Choose a Pitch";
    document.getElementById("speed_text").innerHTML = "Choose a Speed";
    if(pdata._hand == 1){
        document.getElementById('left').className = 'idle';
        document.getElementById('right').className = 'selected';
    }
    else{
        document.getElementById('left').className = 'selected';
        document.getElementById('right').className = 'idle';
    }

    for (i = 1; i < 10; i++) { 
        document.getElementById('p'+String(i)).className = 'idle';
    }
    if(pdata._currentPreset>9){
        document.getElementById('p'+String(pdata._currentPreset-9)).className = 'selected';
   }
   else{
    document.getElementById('p'+String(pdata._currentPreset)).className = 'selected';
   }
   
    document.getElementById('s60').className = 'speedidle';
    document.getElementById('s65').className = 'speedidle';
    document.getElementById('s70').className = 'speedidle';
    document.getElementById('s75').className = 'speedidle';
    document.getElementById('s80').className = 'speedidle';
    document.getElementById('s85').className = 'speedidle';
    document.getElementById('s90').className = 'speedidle';
    document.getElementById('s95').className = 'speedidle';
    document.getElementById('s'+String(pdata._speed)).className = 'speedselected';
}

function drawFire(){
    document.getElementById('fire').className = 'idle';
    if (pdata._repeat == 0){
        pdata._fire = 0;
    }
}

function hand(n){
    if (n<1){ 
        document.getElementById('left').className = 'selected';
        document.getElementById('right').className = 'idle';
        document.getElementById('p1').innerHTML = 'High Outside';
        document.getElementById('p3').innerHTML = 'High Inside';
        document.getElementById('p4').innerHTML = 'Mid Outside';
        document.getElementById('p6').innerHTML = 'Mid Inside';
        document.getElementById('p7').innerHTML = 'Low Outside';
        document.getElementById('p9').innerHTML = 'Low Inside';
        pdata._hand = 0;
        
    } else {
        document.getElementById('right').className = 'selected';
        document.getElementById('left').className = 'idle';
        document.getElementById('p1').innerHTML = 'High Inside';
        document.getElementById('p3').innerHTML = 'High Outside';
        document.getElementById('p4').innerHTML = 'Mid Inside';
        document.getElementById('p6').innerHTML = 'Mid Outside';
        document.getElementById('p7').innerHTML = 'Low Inside';
        document.getElementById('p9').innerHTML = 'Low Outside';
        pdata._hand = 1;
    }
    pdata._command = 1;
    connection.send(JSON.stringify(pdata));
    pdata._command = 0;
}

function preset(n){
    var i;
    if (pdata._state > 0){
        for (i = 1; i < 10; i++) { 
            document.getElementById('p'+String(i)).className = 'idle';
        }
        document.getElementById('p'+String(n)).className = 'selected';

        if(pdata._hand>0){
             pdata._keyedPreset = n+9;
        }
        else{
            pdata._keyedPreset = n;
        }
        pdata._keyed = 1;
        pdata._command = 2;
        connection.send(JSON.stringify(pdata));
        pdata._command = 0;
       drawStatus(2);
    }
}

function sendSpeed(t){
   // preventDefault();
    pdata._speed = t.value;
    for (i = 0; i < 6; i++) { 
        document.getElementById('s'+String((i*5)+70)).className = 'speedidle';
    }
    document.getElementById('s'+String(t)).className = 'speedselected';
    //var speedstr = 'speed ' + String(speed);
   // document.getElementById("sliderVal").innerHTML = t.value;
   // connection.send(speedstr);
   // console.log(speedstr);
}

function fire(){
    if (pdata._state > 0){
        pdata._fire = 1;
        pdata._command = 3;
        document.getElementById('fire').className = 'selected';
        connection.send(JSON.stringify(pdata));
        pdata._command = 0;
    }
}

function repeater(t){
    var rep = document.getElementById('repeat').value;
    if (t.innerHTML == "Repeat") {
        t.innerHTML = "Stop";
        t.className = 'selected';
        pdata._repeat = 1;
    } else {
        t.innerHTML = "Repeat";
        t.className = 'idle';
        pdata._repeat = 0;
        pdata._fire = 0;
        pdata._command = 4;
        connection.send(JSON.stringify(pdata));
        pdata._command = 0;
    }
       // connection.send('right');
       //errorAlerts(1);
}

function handleError(n){
    var i;
        pdata._errorCode = n;
        pdata._command = 5;
        connection.send(JSON.stringify(pdata));
        pdata._command = 0;
        errorMsg = false;
}


function errorAlerts(n){
    switch(n){
        case 1:
        swal({
            title: "Ball Jam!",
            text: "Please open the access door and remove the ball",
            buttons: {
              confirm: {
                text: "Jam Cleared",
                value: "clear",
              },
              //default: true,
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
                swal("Clear the f-ing jam");
            }
          });
    }
}
