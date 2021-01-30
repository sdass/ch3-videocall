//1. libs
var http = require("http");
var fs = require("fs");
var websocket = require("websocket").server;
var util = require('util'); //for avoiding circular structure stringify error
//const { sign } = require("crypto");
//const { log } = require("debug");

//2. global variables
var port = 1111;
var webrtc_clients_array = [];
var webrtc_discussions = {};// key: call_token, value: {various states as keys/values}
var page = undefined;
//------------ web server functions
var http_server = http.createServer(function(req, resp){
    var matches = undefined;
    if(matches = req.url.match("^/images/(.*)")){
        var path = process.cwd() + "images/" + matches[1];
        fs.readFile(path, function(error, data){
            if(error){
                log_error(error);
            }else{
                resp.end(data);
            }
        });
    }else{
        resp.writeHead(200, {'Content-Type': 'text/html'});
        resp.end(page);
    }
    //resp.write(page);
    //resp.end();
});
http_server.listen(port, function(){
    log_comment("server listening on port=" + port);
});

//fs.readFile("3index.html", function(error, data){
    fs.readFile("index.html", function(error, data){
    if(error){
        log_error(error)
    }else{
        page = data;
    }
});

////------------ web socket functions
var websocket_server = new websocket({
    httpServer: http_server
});

websocket_server.on("request", function(request){
    var connection = request.accept(null, request.origin);
    log_comment("new request: " + connection.remoteAddress);
    webrtc_clients_array.push(connection);
    connection.id = webrtc_clients_array.length -1; //connection is object

    connection.on("message", function(message){
        if (message.type === "utf8") {
            log_comment("got message "+message.utf8Data);
        }
        var signal = undefined;
        try { 
                signal = JSON.parse(message.utf8Data); 
               // log_comment('good: ' + JSON.stringify(signal));
        } catch(e) { 
            log_comment("hmm: " + e);
        }
        if(signal){
            if(signal.type === "join" && signal.token !== undefined) {
                try{
                    if(webrtc_discussions[signal.token] === undefined ){
                        webrtc_discussions[signal.token] = {};
                    }
                    webrtc_discussions[signal.token][connection.id] = true;
                }catch(e){
                    log_comment('....1...');
                }
                //console.log('debug: 0 ' + JSON.stringify(connection));
                //console.log('debug: 0 ' + util.inspect(connection));
                // console.log('debug: 1 ' + util.inspect(webrtc_clients_array));
                log_comment('debug: 2 ' + util.inspect(webrtc_discussions));
                console.log("----------------------------");
            } else if(signal.token !== undefined) { //exists already, and newly joining
                try{
                    Object.keys(webrtc_discussions[signal.token]).forEach(function(id){
                        if(id != connection.id) {
                            webrtc_clients_array[id].send(message.utf8Data, log_error);  //study it. sdp xchange. sending to other browser
                            log_comment('sent above message/sdp...');                       
                        }
                    });

                }catch(e){ }

            }else{
                log_comment("invalid signal: "+message.utf8Data);
            }

        }else{
            log_comment("invalid signal: "+message.utf8Data);
        }

    });// connection.on("message" ...) handler

    connection.on("close", function(connection){
        log_comment("connection closed ("+connection.remoteAddress+")" + " sudden-close-connection=" + connection);
        Object.keys(webrtc_discussions).forEach( function(token){ 
            Object.keys(webrtc_discussions[token]).forEach(function(id){ //at least 2 ids
                if(id === connection.id){
                    delete webrtc_discussions[token][id];
                }

            });
        });
    });

} );// websocket_server.on("request"


// utility functions
function log_error(error) {
    if (error !== "Connection closed" && error !== undefined) {
      log_comment("ERROR: "+error);
    }
  }
  function log_comment(comment) {
    console.log((new Date())+" "+comment);
  }
