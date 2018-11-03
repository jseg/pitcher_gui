var rainbowEnable = false;
var holder = false;
var pdata = {
    _state: 0,
    _hand: 1,
    _preset: 5,
    _speed: 60,
    _repeat: 0,
    _fire: 0,
    _command: 0
};

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
    switch(m._state){
        case 0: 
            document.getElementById("status").innerHTML = "Loading...";
            if (pdata._repeat == 0){
                pdata._fire = 0;
            }
            pdata.state = 0;
        break;
        case 1:
            document.getElementById("status").innerHTML = "Aim Pitch";
            for (i = 1; i < 10; i++) { 
                document.getElementById('p'+String(i)).className = 'idle';
            }
            if (pdata._repeat == 0){
                pdata._fire = 0;
            }
            pdata.state = 1;
        break;
        case 2:
            document.getElementById("status").innerHTML = "Ready to Fire";
            document.getElementById('fire').className = 'idle';
            if (pdata._repeat == 0){
                pdata._fire = 0;
            }
            pdata.state = 1;
        break;
        case 3:
             document.getElementById("status").innerHTML = "Firing";
             for (i = 1; i < 10; i++) { 
                document.getElementById('p'+String(i)).className = 'locked';
            }
            document.getElementById('fire').className = 'locked';
            pdata.state = 2;
        break;
    }

};
connection.onclose = function(){
    console.log('WebSocket connection closed');
};

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
    if (pdata.state > 0){
        for (i = 1; i < 10; i++) { 
            document.getElementById('p'+String(i)).className = 'idle';
        }
        document.getElementById('p'+String(n)).className = 'selected';
        pdata._preset = n;
        pdata._command = 2;
        connection.send(JSON.stringify(pdata));
        pdata._command = 0;
        document.getElementById("status").innerHTML = "Aiming...";
    }
}

function sendSpeed(t){
   // preventDefault();
    pdata._speed = t.value;
    //var speedstr = 'speed ' + String(speed);
    document.getElementById("sliderVal").innerHTML = t.value;
   // connection.send(speedstr);
   // console.log(speedstr);
}

function fire(){
    if (pdata.state > 0){
        pdata._fire = 1;
        pdata._command = 3;
        connection.send(JSON.stringify(pdata));
        pdata._command = 0;
    
        for (i = 1; i < 10; i++) { 
            document.getElementById('p'+String(i)).className = 'locked';
        }
        document.getElementById('fire').className = 'locked';
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
}
