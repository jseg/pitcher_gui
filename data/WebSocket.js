var rainbowEnable = false;
var connection = new WebSocket('ws://'+location.hostname+':81/', ['arduino']);
connection.onopen = function () {
    connection.send('Connect ' + new Date());
};
connection.onerror = function (error) {
    console.log('WebSocket Error ', error);
};
connection.onmessage = function (e) {  
    console.log('Server: ', e.data);
};
connection.onclose = function(){
    console.log('WebSocket connection closed');
};


function preset(n){
    var presetstr = 'preset ' + String(n);
    var i;
    for (i = 1; i < 10; i++) { 
        document.getElementById('p'+String(i)).className = 'idle';
    }
    document.getElementById('p'+String(n)).className = 'selected';
    connection.send(presetstr);
    console.log(presetstr);
}

function sendSpeed(){
    var speed = document.getElementById('speed').value;
    var speedstr = 'speed ' + String(speed);
    connection.send(speedstr);
    console.log(speedstr);
}

function fire(){
    connection.send('fire')
    console.log('fire')
}
