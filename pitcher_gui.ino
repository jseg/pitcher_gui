#include <Automaton.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoOTA.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <FS.h>
#include <WebSockets.h>
#include <WebSocketsClient.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <elapsedMillis.h>


ESP8266WiFiMulti wifiMulti;       // Create an instance of the ESP8266WiFiMulti class, called 'wifiMulti'

ESP8266WebServer server(80);       // create a web server on port 80
WebSocketsServer webSocket(81);    // create a websocket server on port 81

Atm_command cmd;  //This object is the primary way to control the machine during development     
char cmd_buffer[160];   // input buffer
enum {CMD_STATE,CMD_LOADING,CMD_AIMING,CMD_AIMED, CMD_FIRING,CMD_PRESET, CMD_VERBOSE, CMD_SYNC};
const char cmdlist[] = //must be in the same order as enum
      "state loading aiming aimed firing preset verbose sync"; 
  
elapsedMillis heartbeat;

const char *ssid = "Pitching Machine"; // The name of the Wi-Fi network that will be created
const char *password = "outofthepark";   // The password required to connect to it, leave blank for an open network

//const char *ssid = "Torrid Zone"; // The name of the Wi-Fi network that will be created
//const char *password = "temp_weak_passcode";   // The password required to connect to it, leave blank for an open network


const char *OTAName = "ESP8266";           // A name and a password for the OTA service
const char *OTAPassword = "esp8266";



const char* mdnsName = "pitcher"; // Domain name for the mDNS responder

bool verbose = false;
int _state = 0;
int _hand = 0;
int _keyed = 0;
int _keyedPreset = 5;
int _currentPreset = 5;
int _speed = 60;
int _repeat = 0;
int _fire = 0;
int _command = 0;
int _totalError = 0;
int _errorCode = 0;
int _nudge = 0;
int _pitch = 0;
int _yaw = 0;
int _spring = 0;

StaticJsonBuffer<300> jsonBuffer;



/*__________________________________________________________SETUP__________________________________________________________*/

void setup() {
  Serial.begin(115200);        // Start the Serial communication to send messages to the computer
  delay(10);
  Serial.println("\r\n");
  cmd.begin( Serial, cmd_buffer, sizeof( cmd_buffer ) ) //start the serial ui
      .list( cmdlist)                                   //assign command list from above
      .onCommand( cmd_callback );                       //assign callback, located in UI.ino


  startWiFi();                 // Start a Wi-Fi access point, and try to connect to some given access points. Then wait for either an AP or STA connection
  
  startOTA();                  // Start the OTA service
  
  startSPIFFS();               // Start the SPIFFS and list all contents

  startWebSocket();            // Start a WebSocket server
  
  startMDNS();                 // Start the mDNS responder

  startServer();               // Start a HTTP server with a file read handler and an upload handler
  
  automaton.run();
}

/*__________________________________________________________LOOP__________________________________________________________*/

void loop() {
  automaton.run();
  webSocket.loop();                           // constantly check for websocket events
  server.handleClient();                      // run the server
  //ArduinoOTA.handle();                        // listen for OTA events
  // if(heartbeat>1000){
  //   Serial.println(F("checkin "));
  //   heartbeat = 0;
  // }

}
/*__________________________________________________________SETUP_FUNCTIONS__________________________________________________________*/

void startWiFi() { // Start a Wi-Fi access point, and try to connect to some given access points. Then wait for either an AP or STA connection
  WiFi.softAP(ssid, password);             // Start the access point
  if(verbose){
    Serial.print("Access Point \"");
    Serial.print(ssid);
    Serial.println("\" started\r\n");
  }
  wifiMulti.addAP("Torrid Zone", "temp_weak_passcode");   // add Wi-Fi networks you want to connect to
  wifiMulti.addAP("luvnlife16.2G", "1cor1313");
  wifiMulti.addAP("luvnlife16", "1cor1313" );
 
  if(verbose){
    Serial.println("Connecting");
  }
  while (wifiMulti.run() != WL_CONNECTED && WiFi.softAPgetStationNum() < 1) {  // Wait for the Wi-Fi to connect
    delay(250);
    if(verbose){
      Serial.print('.');
    }
  }
  if(verbose){
    Serial.println("\r\n");
  }
  if(WiFi.softAPgetStationNum() == 0) {      // If the ESP is connected to an AP
    if(verbose){   
      Serial.print("Connected to ");
      Serial.println(WiFi.SSID());             // Tell us what network we're connected to
      Serial.print("IP address:\t");
      Serial.print(WiFi.localIP());            // Send the IP address of the ESP8266 to the computer
    }
  } else {                                   // If a station is connected to the ESP SoftAP
    if(verbose){
      Serial.print("Station connected to ESP8266 AP");
    }
  }
  if(verbose){
    Serial.println("\r\n");
  }
}

void startOTA() { // Start the OTA service
  ArduinoOTA.setHostname(OTAName);
  ArduinoOTA.setPassword(OTAPassword);

  ArduinoOTA.onStart([]() {
    if(verbose){
      Serial.println("Start");
    }
    
  });
  ArduinoOTA.onEnd([]() {
    if(verbose){
      Serial.println("\r\nEnd");
    }
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    if(verbose){
      Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    }
  });
  ArduinoOTA.onError([](ota_error_t error) {
    if(verbose){
      Serial.printf("Error[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
      else if (error == OTA_END_ERROR) Serial.println("End Failed");
    }
  });
  ArduinoOTA.begin();
  if(verbose){
    Serial.println("OTA ready\r\n");
  }
}

void startSPIFFS() { // Start the SPIFFS and list all contents
  SPIFFS.begin();                             // Start the SPI Flash File System (SPIFFS)
  if(verbose){
    Serial.println("SPIFFS started. Contents:");
  }
  {
    Dir dir = SPIFFS.openDir("/");
    while (dir.next()) {                      // List the file system contents
      String fileName = dir.fileName();
      size_t fileSize = dir.fileSize();
      if(verbose){
      Serial.printf("\tFS File: %s, size: %s\r\n", fileName.c_str(), formatBytes(fileSize).c_str());
      }
    }
    if(verbose){
      Serial.printf("\n");
    }
  }
}

void startWebSocket() { // Start a WebSocket server
  webSocket.begin();                          // start the websocket server
  webSocket.onEvent(webSocketEvent);          // if there's an incomming websocket message, go to function 'webSocketEvent'
  if(verbose){
    Serial.println("WebSocket server started.");
  }
}

void startMDNS() { // Start the mDNS responder
  MDNS.begin(mdnsName);                        // start the multicast domain name server
  if(verbose){
   Serial.print("mDNS responder started: http://");
   Serial.print(mdnsName);
   Serial.println(".local");
  }
}

void startServer() { // Start a HTTP server with a file read handler and an upload handler
  
  server.onNotFound(handleNotFound);          // if someone requests any other file or page, go to function 'handleNotFound'
                                              // and check if the file exists

  server.begin();                             // start the HTTP server
  if(verbose){
    Serial.println("HTTP server started.");
  }
  //Serial.println("active");
}

/*__________________________________________________________SERVER_HANDLERS__________________________________________________________*/

void handleNotFound(){ // if the requested file or page doesn't exist, return a 404 not found error
  if(!handleFileRead(server.uri())){          // check if the file exists in the flash memory (SPIFFS), if so, send it
    server.send(404, "text/plain", "404: File Not Found");
  }
}

bool handleFileRead(String path) { // send the right file to the client (if it exists)
 // Serial.println("handleFileRead: " + path);
  if (path.endsWith("/")) path += "index.html";          // If a folder is requested, send the index file
  String contentType = getContentType(path);             // Get the MIME type
  String pathWithGz = path + ".gz";
  if (SPIFFS.exists(pathWithGz) || SPIFFS.exists(path)) { // If the file exists, either as a compressed archive, or normal
    if (SPIFFS.exists(pathWithGz))                         // If there's a compressed version available
      path += ".gz";                                         // Use the compressed verion
    File file = SPIFFS.open(path, "r");                    // Open the file
    size_t sent = server.streamFile(file, contentType);    // Send it to the client
    file.close();                                          // Close the file again
    if(verbose){
      Serial.println(String("\tSent file: ") + path);
      Serial.println("ready");
    }
    return true;
  }
  if(verbose){
    Serial.println(String("\tFile Not Found: ") + path);   // If the file doesn't exist, return false
  }
  return false;
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) { // When a WebSocket message is received
  switch (type) {
    case WStype_DISCONNECTED:             // if the websocket is disconnected
      if(verbose){
        Serial.printf("[%u] Disconnected!\n", num);
      }
      break;
    case WStype_CONNECTED: {              // if a new websocket connection is established
        IPAddress ip = webSocket.remoteIP(num);
        if(verbose){
          Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
        }
        }
      break;
    case WStype_TEXT:                     // if new text data is received
      JsonObject& root = jsonBuffer.parseObject(payload);
      if(verbose){
        Serial.printf("%s\n", payload);
        root.printTo(Serial); 
      }
      //root = jsonBuffer.parseObject(payload);
      //Test if parsing succeeds.
      if (!root.success()) {
        if(verbose){
         Serial.println("parseObject() failed");
        }
      }
      else{
        _state = root["_state"];
        _hand = root["_hand"];
        _keyedPreset = root["_keyedPreset"];
        _speed = root["_speed"];
        _repeat = root["_repeat"];
        _fire = root["_fire"];
        _command = root["_command"];
        _errorCode = root["_errorCode"];
        _nudge = root["_nudge"];
        if (_command == 1){
          Serial.print("hand ");
          Serial.print(_hand);
          Serial.println(" ");
        }
        if (_command == 2){
          Serial.print("preset ");
          Serial.print(_keyedPreset);
          Serial.println(" ");
        }
        if (_command == 3){
          Serial.print("fire ");
          Serial.print(_fire);
          Serial.print(" ");
          Serial.print(_repeat);
          Serial.print(" ");
          Serial.print(_speed);
          Serial.println(" ");
        }
        if (_command == 4){
          //Serial.println("stop");
          Serial.print("fire ");
          Serial.print(_fire);
          Serial.print(" ");
          Serial.print(_repeat);
          Serial.print(" ");
          Serial.print(_speed);
          Serial.println(" ");
        }
        if (_command == 5){
          Serial.print("handleError ");
          Serial.print(_errorCode);
           Serial.println(" ");
        }
        if (_command == 6){
          Serial.print("nudge 2 0 0");
           Serial.println(" ");
        }
        if (_command == 7){
          Serial.print("nudge -2 0 0");
           Serial.println(" ");
        }
        if (_command == 8){
          Serial.print("nudge 0 2 0");
           Serial.println(" ");
        }
        if (_command == 9){
          Serial.print("nudge 0 -2 0");
           Serial.println(" ");
        }
        if (_command == 10){
          Serial.print("nudge 0 0 2");
           Serial.println(" ");
        }
        if (_command == 11){
          Serial.print("nudge 0 0 -2");
           Serial.println(" ");
        }
        if (_command == 12){
          Serial.print("save");
           Serial.println(" ");
        }
        if (_command == 13){
          Serial.print("factory");
           Serial.println(" ");
        }
      }
      jsonBuffer.clear();
      break;
  }
}

void cmd_callback( int idx, int v, int up) {
  int arg1 = atoi( cmd.arg( 1 ) );
  int arg2 = atoi( cmd.arg( 2 ) );
  int arg3 = atoi( cmd.arg( 3 ) );
  int arg4 = atoi( cmd.arg( 4 ) );
  int arg5 = atoi( cmd.arg( 5 ) );
  int arg6 = atoi( cmd.arg( 6 ) );
  int arg7 = atoi( cmd.arg( 7 ) );
  int arg8 = atoi( cmd.arg( 8 ) );
  int arg9 = atoi( cmd.arg( 9 ) );
  int arg10 = atoi( cmd.arg( 10 ) );
  int arg11 = atoi( cmd.arg( 11 ) );
  int arg12 = atoi( cmd.arg( 12 ) );
  int arg13 = atoi( cmd.arg( 13 ) );
  String outPut;
  JsonObject& root = jsonBuffer.createObject();
  switch ( v ) {
    case CMD_STATE:
      Serial.println("State Command ");
      break;
    case CMD_LOADING:
      Serial.println("Loading Command ");
      _state = 0;
      _fire = 0;
      root["_state"] = _state;
      root["_hand"] = _hand;
      root["_keyed"] = _keyed;
      root["_keyedPreset"] = _keyedPreset;
      root["_currentPpreset"] = _currentPreset;
      root["_speed"] = _speed;
      root["_repeat"] = _repeat;
      root["_fire"] = _fire;
      root["_totalError"] = _totalError;
      if(verbose){
        root.prettyPrintTo(Serial);
      }  
      root.printTo(outPut);
      webSocket.broadcastTXT(outPut);
      break;
    case CMD_AIMING:
      Serial.println("Aiming Command ");
     root["_state"] = _state;
      root["_hand"] = _hand;
      root["_keyed"] = _keyed;
      root["_keyedPreset"] = _keyedPreset;
      root["_currentPpreset"] = _currentPreset;
      root["_speed"] = _speed;
      root["_repeat"] = _repeat;
      root["_fire"] = _fire;
      root["_totalError"] = _totalError;
      if(verbose){   
        root.prettyPrintTo(Serial); 
      }    
      root.printTo(outPut);
      webSocket.broadcastTXT(outPut);
      break;
    case CMD_AIMED:
      Serial.println("Aimed Command ");
      root["_state"] = _state;
      root["_hand"] = _hand;
      root["_keyed"] = _keyed;
      root["_keyedPreset"] = _keyedPreset;
      root["_currentPpreset"] = _currentPreset;
      root["_speed"] = _speed;
      root["_repeat"] = _repeat;
      root["_fire"] = _fire;
      root["_totalError"] = _totalError;
      if(verbose){   
        root.prettyPrintTo(Serial); 
      }    
      root.printTo(outPut);
      webSocket.broadcastTXT(outPut);
      break;

    case CMD_FIRING:
      Serial.println("Firing Command ");
      _state = 3;
      root["_state"] = _state;
      root["_hand"] = _hand;
      root["_keyed"] = _keyed;
      root["_keyedPreset"] = _keyedPreset;
      root["_currentPpreset"] = _currentPreset;
      root["_speed"] = _speed;
      root["_repeat"] = _repeat;
      root["_fire"] = _fire;
      root["_totalError"] = _totalError;
      if(verbose){      
        root.prettyPrintTo(Serial); 
      }      
      root.printTo(outPut);
      webSocket.broadcastTXT(outPut);
      break;
    case CMD_PRESET:
      _currentPreset = arg1;
      root["_state"] = _state;
      root["_hand"] = _hand;
      root["_keyed"] = _keyed;
      root["_keyedPreset"] = _keyedPreset;
      root["_currentPreset"] = _currentPreset;
      root["_speed"] = _speed;
      root["_repeat"] = _repeat;
      root["_fire"] = _fire;
      root["_totalError"] = _totalError;
      if(verbose){       
        root.prettyPrintTo(Serial);   
      } 
      root.printTo(outPut);
      webSocket.broadcastTXT(outPut);
      break;
    
    case CMD_SYNC:
      _state = arg1;
      _hand = arg2;
      _keyed = arg3;
      _repeat = arg4;
      _keyedPreset = arg5;
      _currentPreset = arg6;
      _speed = arg7;
      _totalError = arg8;
      _errorCode = arg9;
      _nudge = arg10;
      _pitch = arg11;
      _yaw = arg12;
      _spring = arg13;
      root["_state"] = _state;
      root["_hand"] = _hand;
      root["_keyed"] = _keyed;
      root["_keyedPreset"] = _keyedPreset;
      root["_currentPreset"] = _currentPreset;
      root["_speed"] = _speed;
      root["_repeat"] = _repeat;
      root["_fire"] = _fire;
      root["_totalError"] = _totalError;
      root["_errorCode"] = _errorCode;
      root["_nudge"] = _nudge;
      root["_pitch"] = _pitch;
      root["_yaw"] = _yaw;
      root["_spring"] = _spring;
      if(verbose){       
        root.prettyPrintTo(Serial);   
      } 
      root.printTo(outPut);
      webSocket.broadcastTXT(outPut);
      break;
    case CMD_VERBOSE:
      verbose = !verbose;
      break;
  }
  jsonBuffer.clear();
}

/*__________________________________________________________HELPER_FUNCTIONS__________________________________________________________*/



String formatBytes(size_t bytes) { // convert sizes in bytes to KB and MB
  if (bytes < 1024) {
    return String(bytes) + "B";
  } else if (bytes < (1024 * 1024)) {
    return String(bytes / 1024.0) + "KB";
  } else if (bytes < (1024 * 1024 * 1024)) {
    return String(bytes / 1024.0 / 1024.0) + "MB";
  }
}

String getContentType(String filename) { // determine the filetype of a given filename, based on the extension
  if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".ico")) return "image/x-icon";
  else if (filename.endsWith(".gz")) return "application/x-gzip";
  return "text/plain";
}
