var gc = null;
window.onload = loaded;

function loaded(e){
	gc = gopherClient;

	//ADD EVENT LISTENERS
	gc.addEventListener(gc.events.login, onLogin);
	gc.addEventListener(gc.events.connected, connected);
	gc.addEventListener(gc.events.disconnected, disconnected);
	gc.addEventListener(gc.events.joined, joined);
	//CONNECT
	gc.connect("meta-gaming.com", 8080, true);
}

function closeMic(){
	gc.voiceChat.closeMic();
}

function connected(){
	console.log("connected!");
	gopherClient.login("Guest #"+Math.round(Math.random()*(1000-1)+1), true);
}

function disconnected(){
	console.log("DISCONNECTED!");
}

function onLogin(success, error){
	if(success){
		console.log("Login success!");
		gopherClient.joinRoom("some room");
	}else{
		console.log(error)
	}
}

function joined(success, error){
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
