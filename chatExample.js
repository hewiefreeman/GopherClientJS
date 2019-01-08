var gc = null;
window.onload = loaded;

function loaded(e){
	console.log("loading...")
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
	//CONNECT
	gc.connect("localhost", 8080, false);
}

function connected(){
	console.log("connect success!");

	//ENABLE LOGIN
	document.getElementById("loginBtn").onclick = function(){
		var login = document.getElementById("loginText").value;
		var pass = document.getElementById("passText").value;
		gc.login(login, pass, false, document.getElementById("guestCheck").checked);
	};
}

function disconnected(){
	console.log("DISCONNECTED!");
}

//////////////////  LOGIN  //////////////////////////////
function onLogin(userName, error){
	if(error != null){
		console.log("Error: "+error);
	}else{
		console.log("Logged in as: "+userName);
		//ENTER TEST ROOM
		gc.joinRoom("chatExample")
	}
}

//////////////////  LOGOUT  //////////////////////////////
function onLogout(success, error){
	if(error != null){
		console.log("Error: "+error);
	}else{
		console.log("You have been logged out");
	}
}

//////////////////  JOINED ROOM  //////////////////////////////
function joinedRoom(success, error){
	if(error != null){
		console.log("Error: "+error.id);
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
