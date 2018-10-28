gopherClient = new GopherServerClient();

function GopherServerClient() {
	//INIT OBJECTS
	this.ip = "";
	this.port = 0;
	this.socketURL = "";
	this.ssl = false;
	this.onConnect = null;
	this.onDisconnect = null;
	this.socket = null;

	//
	this.connected = false;
	this.loggedIn = false;
	this.userName = "";
	this.roomName = "";

	//DEFINITIONS
	this.clientActionDefs = {
						login: "li",
						logout: "lo",
						joinRoom: "j",
						leaveRoom: "lr",
						chatMessage: "c",
						};
	this.messageTypes = {
					CHAT: 0,
					PRIVATE: 1,
					SERVER: 2,
					};
	this.serverMessageTypes = {
						GAME: 0,
						NOTICE: 1,
						IMPORTANT: 2,
						};

	//ERROR MESSAGES
	this.paramError = "An incorrect parameter type was supplied"
}

GopherServerClient.prototype.connect = function(ip, port, ssl, onConnect, onDisconnect){
	if(ip.constructor != String || port.constructor != Number || ssl.constructor != Boolean
			|| onConnect.constructor != Function || onDisconnect.constructor != Function){
		return paramError;
	}

	//SET CONFIG
	this.ip = ip;
	this.port = port;
	this.ssl = ssl;
	if(ssl === true){
		this.socketURL = "wss://"+ip+":"+port+"/wss";
	}else{
		this.socketURL = "ws://"+ip+":"+port+"/ws";
	}

	//SET CALLBACKS
	this.onConnect = onConnect;
	this.onDisconnect = onDisconnect;

	//START WEBSOCKET
	this.socket = new WebSocket(this.socketURL);
	this.socket.addEventListener("open", this.sO);
	this.socket.addEventListener("close", this.sD);
	this.socket.addEventListener("message", this.sR);
}

GopherServerClient.prototype.disconnect = function(){
	this.socket.close();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   SOCKET LISTENERS   //////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

GopherServerClient.prototype.sO = function(e){
	var self = gopherClient;

	//
	self.onConnect();
}

GopherServerClient.prototype.sD = function(e){
	var self = gopherClient;

	//
	self.socket.removeEventListener("open", self.sO);
	self.socket.removeEventListener("close", self.sD);
	self.socket.removeEventListener("message", self.sR);

	//
	self.connected = false;
	self.loggedIn = false;
	self.userName = "";
	self.roomName = "";

	//
	self.onDisconnect();
}

GopherServerClient.prototype.sR = function(e){
	var data = JSON.parse(e.data);
	gopherClient.sRhandle(data);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   SOCKET MESSAGE HANDLER   ////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

GopherServerClient.prototype.sRhandle = function(data){
	if(data.v !== undefined){
		//Voice stream (high priority)
	}else if(data.d !== undefined){
		//RECIEVED DATA (high priority)
	}else if(data.cr !== undefined){
		//CLIENT ACTION RESPONSE
		switch(data.cr){
			case this.clientActionDefs.login:
				this.loginReponse(data.cr);

			case this.clientActionDefs.logout:
				this.logoutReponse(data.cr);

			case this.clientActionDefs.joinRoom:
				this.joinRoomResponse(data.cr);
		}
	}else if(data.mt !== undefined){
		//REVIEVED MESSAGE
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   BUILT-IN CLIENT ACTION FUNCTIONS/HANDLERS   /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// LOG IN //////////////////////////////////////////////////

GopherServerClient.prototype.login = function(userName, isGuest, callback){
	if(userName.constructor !== String || isGuest.constructor !== Boolean || (callback !== undefined && callback.constructor !== Function)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.login, P: {n: userName, g: isGuest}}));
	this.loginCallback = callback;
}

GopherServerClient.prototype.loginReponse = function(data){
	if(data.e !== undefined){
		if(this.loginCallback !== undefined){
			this.loginCallback(false, data.e);
		}
	}else{
		this.userName = data.r;
		this.loggedIn = true;
		//
		if(this.loginCallback !== undefined){
			this.loginCallback(true, null);
		}
	}
}

// LOG OUT //////////////////////////////////////////////////

GopherServerClient.prototype.logout = function(callback){
	if(callback !== undefined && callback.constructor !== Function){
		return paramError
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.logout, P: null}));
	this.logoutCallback = callback;
}

GopherServerClient.prototype.logoutReponse = function(data){
	if(data.e !== undefined){
		if(this.logoutCallback !== undefined){
			this.logoutCallback(false, data.e);
		}
	}else{
		this.userName = "";
		this.loggedIn = false;
		this.roomName = "";
		//
		if(this.logoutCallback !== undefined){
			this.logoutCallback(true, null);
		}
	}
}

// JOIN ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.joinRoom = function(roomName, callback){
	if(roomName.constructor !== String || (callback !== undefined && callback.constructor !== Function)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.joinRoom, P: {n: roomName}}));
	this.joinRoomCallback = callback;
}

GopherServerClient.prototype.joinRoomResponse = function(data){
	if(data.e !== undefined){
		if(this.joinRoomCallback !== undefined){
			this.joinRoomCallback(false, data.e);
		}
	}else{
		this.roomName = data.r;
		//
		if(this.joinRoomCallback !== undefined){
			this.joinRoomCallback(true, null);
		}
	}
}

// CHAT MESSAGE //////////////////////////////////////////////////

GopherServerClient.prototype.chatMessage = function(message){
	if(message.constructor !== String || (callback !== undefined && callback.constructor !== Function)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.joinRoom, P: {n: roomName}}));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   OBJECT GETTERS   ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   OBJECT SETTERS   ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
