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
						chatMessage: "c"
						};
	this.messageTypes = {
					CHAT: 0,
					PRIVATE: 1,
					SERVER: 2
					};
	this.serverMessageTypes = {
						GAME: 0,
						NOTICE: 1,
						IMPORTANT: 2
						};

	//GOPHER SERVER EVENTS
	this.events = {
				login: "onlogin",
				logout: "onlogout",
				connected: "onconnect",
				disconnected: "ondisconnect",
				joined: "onjoinroom",
				left: "onleaveroom",
				chat: "onchatmessage",
				server: "onservermessage",
				data: "ondatamessage"
				};
	this.onLoginListener = null;
	this.onLogoutListener = null;
	this.onConnectListener = null;
	this.onDisconnectListener = null;
	this.onJoinRoomListener = null;
	this.onLeaveRoomListener = null;
	this.onChatMsgListener = null;
	this.onServerMsgListener = null;
	this.onDataMsgListener = null;

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
//   GOPHER EVENT LISTENERS   ////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

GopherServerClient.prototype.addEventListener = function(type, callback){
	if(type.constructor !== String || callback == null || callback === undefined || callback.constructor !== Function){
		return paramError;
	}
	/*login: "onlogin",
	logout: "onlogout",
	connected: "onconnect",
	disconnected: "ondisconnect",
	joined: "onjoinroom",
	left: "onleaveroom",
	chat: "onchatmessage",
	server: "onservermessage",
	data: "ondatamessage"*/
	switch(type){
		case this.events.login:
			this.onLoginListener = callback;

		case this.events.logout:
			this.onLogoutListener = callback;

		case this.events.connected:
			this.onConnectListener = callback;

		case this.events.disconnected:
			this.onDisconnectListener = callback;

		case this.events.joined:
			this.onJoinRoomListener = callback;

		case this.events.left:
			this.onLeaveRoomListener = callback;

		case this.events.chat:
			this.onChatMsgListener = callback;

		case this.events.server:
			this.onServerMsgListener = callback;

		case this.events.data:
			this.onDataMsgListener = callback;
	}
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

			case this.clientActionDefs.leaveRoom:
				this.leaveRoomResponse(data.cr);
		}
	}else if(data.mt !== undefined){
		//REVIEVED MESSAGE
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   BUILT-IN CLIENT ACTION FUNCTIONS/HANDLERS   /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// LOG IN //////////////////////////////////////////////////

GopherServerClient.prototype.login = function(userName, isGuest){
	if(userName.constructor !== String || isGuest.constructor !== Boolean){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.login, P: {n: userName, g: isGuest}}));
}

GopherServerClient.prototype.loginReponse = function(data){
	if(data.e !== undefined){
		if(this.onLoginListener != null){
			this.onLoginListener("", data.e);
		}
	}else{
		this.userName = data.r;
		this.loggedIn = true;
		//
		if(this.onLoginListener != null){
			this.onLoginListener(data.r, null);
		}
	}
}

// LOG OUT //////////////////////////////////////////////////

GopherServerClient.prototype.logout = function(){
	this.socket.send(JSON.stringify({A: this.clientActionDefs.logout}));
}

GopherServerClient.prototype.logoutReponse = function(data){
	if(data.e !== undefined){
		if(this.onLogoutListener != null){
			this.onLogoutListener(false, data.e);
		}
	}else{
		this.userName = "";
		this.loggedIn = false;
		this.roomName = "";
		//
		if(this.onLogoutListener != null){
			this.onLogoutListener(true, null);
		}
	}
}

// JOIN ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.joinRoom = function(roomName){
	if(roomName.constructor !== String){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.joinRoom, P: roomName}));
}

GopherServerClient.prototype.joinRoomResponse = function(data){
	if(data.e !== undefined){
		if(this.onJoinRoomListener != null){
			this.onJoinRoomListener("", data.e);
		}
	}else{
		this.roomName = data.r;
		//
		if(this.onJoinRoomListener != null){
			this.onJoinRoomListener(data.r, null);
		}
	}
}

// LEAVE ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.leaveRoom = function(){
	this.socket.send(JSON.stringify({A: this.clientActionDefs.leaveRoom}));
}

GopherServerClient.prototype.leaveRoomResponse = function(data){
	if(data.e !== undefined){
		if(this.onLeaveRoomListener != null){
			this.onLeaveRoomListener(false, data.e);
		}
	}else{
		this.roomName = "";
		//
		if(this.onLeaveRoomListener != null){
			this.onLeaveRoomListener(true, null);
		}
	}
}

// CHAT MESSAGE //////////////////////////////////////////////////

GopherServerClient.prototype.chatMessage = function(message){
	if(message.constructor !== String && message.constructor !== Object && message.constructor !== Array){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.chatMessage, P: message}));
}

// SET USER VAR //////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////////////////
//   OBJECT GETTERS   ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   OBJECT SETTERS   ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
