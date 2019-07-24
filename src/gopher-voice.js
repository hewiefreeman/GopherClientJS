function GopherVoiceChat(){
	//Defaults
	this.volume = 1; // Voice chat output volume: 0-1
	this.bSize = 300; // buffer size in milliseconds
	this.vcPing = 300; // buffer size in milliseconds

	//PING TIMER
	this.pT = 0;

	//INIT OBJECTS FOR MediaStream
	this.acO = null; // AudioContext out
	this.oG = null; // output gain
	this.mRa = [null, null]; // MediaRecorder array
	this.mRs = 0; // MediaRecorder switcher
	this.mS = null; // MediaStream/LocalMediaStream
	this.mO = false; // Mis is open
	this.vidEl = null; // Hidded <video> for Blob duration

	//MUTE LIST
	this.mList = {};

	//DEFINITIONS
	this.BUFFER_SIZE_SMALL = 150; // EXPOSE IN DOCS
	this.BUFFER_SIZE_MEDIUM = 225; // EXPOSE IN DOCS
	this.BUFFER_SIZE_LARGE = 300; // EXPOSE IN DOCS
}

GopherVoiceChat.prototype.setVolume = function(volume){ // EXPOSE IN DOCS
	if(volume === undefined || volume == null || volume.constructor != Number){
		return;
	}
	if(volume > 1){
		this.volume = 1;
	}else if(volume < 0){
		this.volume = 0;
	}else{
		this.volume = volume;
	}
}

GopherVoiceChat.prototype.setBufferSize = function(bufferSize){ // EXPOSE IN DOCS
	if(bufferSize === undefined || bufferSize == null || bufferSize.constructor != Number){
		return;
	}
	this.bSize = Math.round(bufferSize);
	this.vcPing = Math.round(bufferSize/3);
}

GopherVoiceChat.prototype.startVoiceChannels = function(){ // FOR CHROME AUTO-PLAY. MAKE A BUTTON OR USER INTERACTION TO CALL THIS FUNCTION.
	this.acO = new AudioContext();					// MUST AT LEAST CALL BEFORE VOICE CHAT CAN WORK.
	//FOR BLOB DURATION								// EXPOSE IN DOCS
	this.vidEl = document.createElement('video');
}

GopherVoiceChat.prototype.muteUser = function(userName){ // EXPOSE IN DOCS
	this.mList[userName] = 1;
}

GopherVoiceChat.prototype.openMic = function(){ // EXPOSE IN DOCS
	if(this.acO == null){
		return "[gopherChat.voiceChat] You must call gopherClient.voiceChat.startOutputChannel() to enable voice chat"
	}else if(!gopherClient.connected || !gopherClient.loggedIn || gopherClient.roomName == ""){
		return "[gopherChat.voiceChat] You must be logged in and in a room to open the microphone";
	}
	var self = this;

	//GET THE MICROPHONE INPUT STREAM TYPE
	var media = navigator.mediaDevices.getUserMedia({audio:true})
	media.then(function(e) {
				self.mS = e;
				self.cMS(e);
			}
	);
	media.catch(function(e) {
				console.log("[gopherChat.voiceChat]  Error reading input from microphone");
			}
	);
	//
	this.mO = true;
	return null;
}

GopherVoiceChat.prototype.closeMic = function(){ // EXPOSE IN DOCS
	if(this.acO == null){
		return "[gopherChat.voiceChat] You must call gopherClient.voiceChat.startOutputChannel() to enable voice chat"
	}
	if(this.mS != null){
		this.mS.getAudioTracks()[0].stop();
	}
	if(this.mRa[0] != null){
		this.mRa[0].stop();
		this.mRa[0] = null;
	}
	if(this.mRa[1] != null){
		this.mRa[1].stop();
		this.mRa[1] = null;
	}
	//
	this.mRa = [null, null];
	this.mRs = 0;
	this.mO = false;
	return null
}

//CAPTURE MEDIA STREAM
GopherVoiceChat.prototype.cMS = function(audioStream){
	var self = this;
	this.mS = audioStream;
	this.mRa[this.mRs] = new MediaRecorder(audioStream, {mimeType: 'audio/webm;codecs=opus'});
	this.mRa[this.mRs].start();
	this.mRa[this.mRs].ondataavailable = function(e) {
		if(e.data.size <= 50){
			return; // DON'T BOTHER PROCESSING ANYTHING <= 50 BYTES
		}
		//CONVERT BLOB INTO STRING FOR JSON
		self.pT = performance.now(); // SET PING TIMER
		var dataURLConvert = new FileReader();
		dataURLConvert.onloadend = () => {
			//SEND AUDIO STRING TO SERVER
			gopherClient.socket.send(JSON.stringify({A:gopherClient.clientActionDefs.voiceStream,P:dataURLConvert.result}));
		}
		dataURLConvert.readAsDataURL(e.data);
	};
	setTimeout(this.cMSr, this.bSize);
}

//MediaStream loop
GopherVoiceChat.prototype.cMSr = function(){
	var self = gopherClient.voiceChat;
	if(self.mRa[self.mRs] != null && self.mS.active){
		//SWITCH NUMBER OF MAIN MediaRecorder
		if(self.mRs == 1){
			self.mRs = 0;
		}else{
			self.mRs = 1;
		}
		//MAKE NEW MediaRecorder MAIN IF MIC IS STILL OPEN
		if(self.mO){
			self.cMS(self.mS);
		}
		//ADD PING TIME TO MediaRecorder FROM BEFORE
		setTimeout(self.cMSrob, self.vcPing);
	}
}

//MediaSteam loop over-buffer
GopherVoiceChat.prototype.cMSrob = function(){
	var self = gopherClient.voiceChat;
	//STOP MediaRecorder NOT CURRENTLY MAIN
	if(self.mRs == 1){
		if(self.mRa[0] != null && self.mS.active){
			self.mRa[0].stop();
			self.mRa[0] = null;
		}
	}else{
		if(self.mRa[1] != null && self.mS.active){
			self.mRa[1].stop();
			self.mRa[1] = null;
		}
	}

}

// RECEIVED VOICE CHAT DATA FROM SERVER
GopherVoiceChat.prototype.rD = function(data){
	var self = this;
	if(this.mList[data.u] != undefined){
		return;
	}
	//PROCESSING Blob audio
	blobFromText = new Blob([convertDataURIToBinary(data.d)], {type: 'audio/webm;codecs=opus'});
	if(blobFromText.size <= 50){
		return; // DON'T BOTHER PROCESSING ANYTHING <= 50 BYTES
	}
	this.getBlobDuration(blobFromText).then(function(duration){
		//
		var fileReader = new FileReader();
		fileReader.onloadend = () => {
			var decoder = self.acO.decodeAudioData(fileReader.result)
			.then(function(data){
					var source = self.acO.createBufferSource();
					source.buffer = data;
					var gain = self.acO.createGain();
					gain.gain.value = self.volume;
					source.connect(gain);
					gain.connect(self.acO.destination);
					gain.gain.setValueAtTime(0.01, 0);
					gain.gain.exponentialRampToValueAtTime(self.volume, 0.005);
					gain.gain.setValueAtTime(self.volume, duration - 0.005);
					gain.gain.exponentialRampToValueAtTime(0.01, duration);
					source.start();
			})
			.catch(function(e){
					console.log("[gopherChat.voiceChat] Error decoding voice stream data");
			});
		};
		fileReader.readAsArrayBuffer(blobFromText);
	});
}

//GOT VOICE CHAT PING FROM SERVER
GopherVoiceChat.prototype.pD = function(){
	var ping = (performance.now()-this.pT)*100;
	this.vcPing = (this.vcPing+ping)/2;
	//console.log("Ping is now: "+this.vcPing);
}

////////// GISTS

// FROM: https://gist.github.com/borismus/1032746
var BASE64_MARKER = ';base64,';
function convertDataURIToBinary(dataURI) {
	var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
	var base64 = dataURI.substring(base64Index);
	var raw = window.atob(base64);
	var rawLength = raw.length;
	var array = new Uint8Array(new ArrayBuffer(rawLength));
	for(i = 0; i < rawLength; i++) {
		array[i] = raw.charCodeAt(i);
	}
	return array;
}

// FROM: https://github.com/evictor/get-blob-duration/blob/master/src/getBlobDuration.js
// MODIFIED FOR Gopher Client
GopherVoiceChat.prototype.getBlobDuration = function(blob){
	var self = this;
	var durationP = new Promise(resolve =>
	this.vidEl.addEventListener('loadedmetadata', () => {
		// Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
		if(self.vidEl.duration === Infinity) {
			self.vidEl.currentTime = Number.MAX_SAFE_INTEGER;
			self.vidEl.ontimeupdate = () => {
				self.vidEl.ontimeupdate = null;
				resolve(self.vidEl.duration);
				self.vidEl.currentTime = 0;
			}
		}else
			resolve(self.vidEl.duration)
		})
	);
	this.vidEl.src = window.URL.createObjectURL(blob);
	return durationP;
}
