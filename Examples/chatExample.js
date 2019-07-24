var gc = null;
window.onload = loaded;

function loaded(e){
	gc = gopherClient;

	//SERVER CONNECTION LISTENERS
	gc.addEventListener(gc.events.connected, connected);
	gc.addEventListener(gc.events.disconnected, disconnected);
	//SIGNUP/LOGIN LISTENERS
	gc.addEventListener(gc.events.login, onLogin);
	gc.addEventListener(gc.events.logout, onLogout);
	//ROOM LISTENERS
	gc.addEventListener(gc.events.joined, joinedRoom)
	//CHAT LISTENERS
	gc.addEventListener(gc.events.chatMessage, onChat)
	gc.addEventListener(gc.events.privateMessage, onPM)
	gc.addEventListener(gc.events.serverMessage, onServerMessage)
	//CONNECT
	gc.connect("localhost", 8080, false);
}

function connected(){
	console.log("connect success!");

	//ENABLE LOGIN
	document.getElementById("loginBtn").onclick = function(){
		var login = document.getElementById("loginText").value;
		var pass = document.getElementById("passText").value;
		var rememberMe = document.getElementById("rememberCheck").checked;
		var guest = document.getElementById("guestCheck").checked;
		gc.login(login, pass, rememberMe, guest);
	};
}

function disconnected(){
	console.log("DISCONNECTED!");
}

//////////////////  LOGIN  //////////////////////////////
function onLogin(userName, error){
	if(error != null){
		console.log("Error: [ID - "+error.id+"], [Message - '"+error.m+"']");
	}else{
		console.log("Logged in as: "+userName);
		//ENTER TEST ROOM
		gc.joinRoom("chatExample")
	}
}

//////////////////  LOGOUT  //////////////////////////////
function onLogout(success, error){
	if(error != null){
		console.log("Error: [ID - "+error.id+"], [Message - '"+error.m+"']");
	}else{
		console.log("You have been logged out");
	}
}

//////////////////  JOINED ROOM  //////////////////////////////
function joinedRoom(success, error){
	if(error != null){
		console.log("Error: [ID - "+error.id+"], [Message - '"+error.m+"']");
	}else{
		console.log("Joined room!");

		//SEND CHAT MESSAGE
		document.getElementById("chatBtn").onclick = function(){
			var message = document.getElementById("chatText").value;
			gc.chatMessage(message);
		};

		//SEND PRIVATE MESSAGE
		document.getElementById("pmBtn").onclick = function(){
			var user = document.getElementById("pmUserText").value;
			var message = document.getElementById("pmMessageText").value;
			gc.privateMessage(user, message);
		};
	}
}

//////////////////  CHAT MESSAGES  //////////////////////////////
function onChat(user, message){
	console.log("["+gc.getRoom()+"]"+user+": "+message);
}

//////////////////  PRIVATE MESSAGES  //////////////////////////////
function onPM(from, to, message){
	console.log(from+" [to] "+to+": "+message);
}

//////////////////  SERVER MESSAGES  //////////////////////////////
function onServerMessage(type, message){
	console.log("Server Message ("+gc.serverMessageNames[type]+"): "+message);
}
