var gc = null;
window.onload = loaded;

function loaded(e){
	gc = gopherClient;

	//ADD EVENT LISTENERS
	gc.addEventListener(gc.events.login, onLogin);
	gc.addEventListener(gc.events.logout, onLogout);
	gc.addEventListener(gc.events.signup, onSignup);
	gc.addEventListener(gc.events.accountInfoChange, onInfoChange);
	gc.addEventListener(gc.events.accountDelete, onDeleteAccount);
	gc.addEventListener(gc.events.passwordChange, onPasswordChange);
	gc.addEventListener(gc.events.connected, connected);
	gc.addEventListener(gc.events.disconnected, disconnected);
	//gc.addEventListener(gc.events.joined, joined);
	//CONNECT
	gc.connect("localhost", 8080, false);
}

function closeMic(){
	gc.voiceChat.closeMic();
}

function connected(){
	console.log("connected!");

	//userName, password, customCols
	//gc.signup("Vok0me", "l2pdmger", {email: "dominiquedebergio@gmail.com"});

	//userName, isGuest, password, rememberMe, customCols
	gc.login("dominiquedebergue@gmail.com", "l2pdmger");

	//userName, password, customCols
	//gc.deleteAccount("Bobby McGee", "ftwomg");
}

function disconnected(){
	console.log("DISCONNECTED!");
}

function onSignup(success, error){
	if(success){
		console.log("Sign up success!");
	}else{
		console.log(error);
	}
}

function onLogin(success, error){
	if(success){
		console.log("Login success!");

		//password, newPassword, customCols
		//gc.changePassword("ftwomg", "ftwdmg");

		//password, customCols
		//gc.changeAccountInfo("l2pdmger", {email:"dominiquedebergue@gmail.com"});

	}else{
		console.log(error)
	}
}

function onLogout(success, error){
	if(success){
		console.log("You have been logged out.");

		//password, newPassword, customCols
		//gc.changePassword("ftwomg", "ftwdmg");

	}else{
		console.log(error)
	}
}

function onDeleteAccount(success, error){
	if(success){
		console.log("Delete account success!");
	}else{
		console.log(error);
	}
}

function onPasswordChange(success, error){
	if(success){
		console.log("Password change success!");
	}else{
		console.log(error);
	}
}

function onInfoChange(success, error){
	if(success){
		console.log("Password change success!");
	}else{
		console.log(error);
	}
}

/*function joined(success, error){
	if(success){
		console.log("Join room success!");
		gc.voiceChat.setBufferSize(gc.voiceChat.BUFFER_SIZE_LARGE);
		//MAKE BUTTON CLICKABLE TO SEND AUDIO STREAM
		document.getElementById("box").onclick = function(){
			gc.voiceChat.startVoiceChannels();
		}
		var micOn = false;
		window.onkeydown = function(e){
			if(!micOn){
				console.log(gc.voiceChat.openMic());
				micOn = true;
			}
		}
		window.onkeyup = function(e){
			if(micOn){
				console.log(gc.voiceChat.closeMic());
				micOn = false;
			}
		}
		//////////////////////////////////////////////

	}else{
		console.log(error)
	}
}
*/
