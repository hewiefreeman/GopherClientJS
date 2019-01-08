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
	//FRIEND LISTENERS
	/*gc.addEventListener(gc.events.friendRequested, onRequestFriend);// WHEN YOU REQUEST A FRIEND
	gc.addEventListener(gc.events.friendAccepted, onAcceptFriend);// WHEN YOU ACCEPT A REQUEST
	gc.addEventListener(gc.events.friendDeclined, onDeclineFriend);// WHEN YOU DECLINE A REQUEST
	gc.addEventListener(gc.events.friendRemoved, onRemoveFriend);// WHEN A FRIEND GETS REMOVED OR WHEN A USER DECLINES YOUR REQUEST
	gc.addEventListener(gc.events.friendRequestRecieved, onRecieveFriendRequest);// WHEN YOU RECIEVE A FRIEND REQUEST FROM ANOTHER USER
	gc.addEventListener(gc.events.friendRequestAccepted, onRecieveFriendAccept);// WHEN YOUR REQUEST TO ANOTHER USER IS ACCEPTED
	gc.addEventListener(gc.events.friendStatusChanged, onFriendStatusChange);// WHEN A FRIEND'S STATUS CHANGES
	gc.addEventListener(gc.events.statusChanged, onStatusChange);*/
	//CONNECT
	gc.connect("localhost", 8080, false);
}

function connected(){
	console.log("connect success!");
	//ENABLE UI

	//LOGIN
	document.getElementById("loginBtn").onclick = function(){
		var login = document.getElementById("loginText").value;
		var pass = document.getElementById("passText").value;
		gc.login(login, pass);
	};

	//SET SINGLE USER VARIABLE
	document.getElementById("setVarBtn").onclick = function(){
		var key = document.getElementById("setVarKeyText").value;
		var val = document.getElementById("setVarValText").value;
		gc.setUserVariable(key, val);
	};

	//SET MULTIPLE USER VARIABLES
	document.getElementById("setVarsBtn").onclick = function(){
		var vars = {}
		vars[document.getElementById("setVarsKeyText1").value] = document.getElementById("setVarsValText1").value;
		vars[document.getElementById("setVarsKeyText2").value] = document.getElementById("setVarsValText2").value;
		vars[document.getElementById("setVarsKeyText3").value] = {num: parseInt(document.getElementById("setVarsValText3").value)};
		gc.setUserVariables(vars);
	};

	//GET YOUR USER VARIABLES
	document.getElementById("getVarsBtn").onclick = function(){
		console.log(gc.userVars)
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
