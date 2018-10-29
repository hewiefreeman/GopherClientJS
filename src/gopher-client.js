gopherClient = new GopherServerClient();

function GopherServerClient() {
	//INIT OBJECTS
	this.ip = "";
	this.port = 0;
	this.socketURL = "";
	this.ssl = false;
	this.socket = null;

	//
	this.connected = false;
	this.loggedIn = false;
	this.guest = false;
	this.userName = "";
	this.roomName = "";
	this.status = 0;

	//DEFINITIONS
	this.statusList = ["Available", "In Game", "Idle", "Offline"];
	this.clientActionDefs = {
						login: "li",
						logout: "lo",
						joinRoom: "j",
						leaveRoom: "lr",
						createRoom: "r",
						deleteRoom: "rd",
						roomInvite: "i",
						revokeInvite: "ri",
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
				roomCreate: "oncreateroom",
				roomDelete: "ondeleteroom",
				invited: "oninvite",
				inviteRevoked: "onrevokeinvite",
				chatMessage: "onchatmessage",
				privateMessage: "onprivatemessage",
				serverMessage: "onservermessage",
				data: "ondata"
				};
	this.onLoginListener = null;
	this.onLogoutListener = null;
	this.onConnectListener = null;
	this.onDisconnectListener = null;
	this.onJoinRoomListener = null;
	this.onLeaveRoomListener = null;
	this.onCreateRoomListener = null;
	this.onDeleteRoomListener = null;
	this.onInviteListener = null;
	this.onRevokeListener = null;
	this.onChatMsgListener = null;
	this.onPrivateMsgListener = null;
	this.onServerMsgListener = null;
	this.onDataListener = null;

	//ERROR MESSAGES
	this.paramError = "An incorrect parameter type was supplied"
}

GopherServerClient.prototype.connect = function(ip, port, ssl){
	if(ip.constructor != String || port.constructor != Number || ssl.constructor != Boolean){
		return paramError;
	}

	//SET CONFIG
	this.ip = ip;
	this.port = port;
	this.ssl = ssl;
	if(ssl == true){
		this.socketURL = "wss://"+ip+":"+port+"/wss";
	}else{
		this.socketURL = "ws://"+ip+":"+port+"/ws";
	}

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
	self.connected = true;

	//
	if(self.onConnectListener != null){
		self.onConnectListener();
	}
}

GopherServerClient.prototype.sD = function(e){
	var self = gopherClient;

	//
	self.socket.removeEventListener("open", self.sO);
	self.socket.removeEventListener("close", self.sD);
	self.socket.removeEventListener("message", self.sR);

	//RESET VARIABLES
	self.connected = false;
	self.loggedIn = false;
	self.guest = false;
	self.userName = "";
	self.roomName = "";

	//DESTROY LISTENERS
	self.onLoginListener = null;
	self.onLogoutListener = null;
	self.onConnectListener = null;
	self.onJoinRoomListener = null;
	self.onLeaveRoomListener = null;
	self.onCreateRoomListener = null;
	self.onDeleteRoomListener = null;
	self.onInviteListener = null;
	self.onRevokeListener = null;
	self.onChatMsgListener = null;
	this.onPrivateMsgListener = null;
	self.onServerMsgListener = null;
	self.onDataListener = null;

	//CALL THE DISCONNECT LISTENER BEFORE DESTROYING
	if(self.onDisconnectListener != null){
		self.onDisconnectListener();
		self.onDisconnectListener = null;
	}
}

GopherServerClient.prototype.sR = function(e){
	var data = JSON.parse(e.data);
	gopherClient.sRhandle(data);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   GOPHER EVENT LISTENERS   ////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

GopherServerClient.prototype.addEventListener = function(type, callback){
	if(type.constructor != String || callback == null || callback === undefined || callback.constructor != Function){
		return paramError;
	}
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

		case this.events.roomCreate:
			this.onCreateRoomListener = callback;

		case this.events.roomDelete:
			this.onDeleteRoomListener = callback;

		case this.events.invited:
			this.onInviteListener = callback;

		case this.events.inviteRevoked:
			this.onRevokeListener = callback;

		case this.events.chatMessage:
			this.onChatMsgListener = callback;

		case this.events.privateMessage:
			this.onPrivateMsgListener = callback;

		case this.events.serverMessage:
			this.onServerMsgListener = callback;

		case this.events.data:
			this.onDataListener = callback;
	}
}

GopherServerClient.prototype.removeEventListener = function(type){
	if(type.constructor != String){
		return paramError;
	}
	switch(type){
		case this.events.login:
			this.onLoginListener = null;

		case this.events.logout:
			this.onLogoutListener = null;

		case this.events.connected:
			this.onConnectListener = null;

		case this.events.disconnected:
			this.onDisconnectListener = null;

		case this.events.joined:
			this.onJoinRoomListener = null;

		case this.events.left:
			this.onLeaveRoomListener = null;

		case this.events.roomCreate:
			this.onCreateRoomListener = null;

		case this.events.roomDelete:
			this.onDeleteRoomListener = null;

		case this.events.invited:
			this.onInviteListener = null;

		case this.events.inviteRevoked:
			this.onRevokeListener = null;

		case this.events.chatMessage:
			this.onChatMsgListener = null;

		case this.events.privateMessage:
			this.onPrivateMsgListener = null;

		case this.events.serverMessage:
			this.onServerMsgListener = null;

		case this.events.data:
			this.onDataListener = null;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   SOCKET MESSAGE HANDLER   ////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

GopherServerClient.prototype.sRhandle = function(data){
	if(data.v !== undefined){
		//VOICE STREAM (highest look-up priority)
	}else if(data.d !== undefined){
		//RECIEVED DATA (high look-up priority)
		if(this.onDataListener != null){
			this.onDataListener(data.d);
		}
	}else if(data.c !== undefined){
		//CLIENT ACTION RESPONSE
		switch(data.c){
			case this.clientActionDefs.login:
				this.loginReponse(data.c);

			case this.clientActionDefs.logout:
				this.logoutReponse(data.c);

			case this.clientActionDefs.joinRoom:
				this.joinRoomResponse(data.c);

			case this.clientActionDefs.leaveRoom:
				this.leaveRoomResponse(data.c);

			case this.clientActionDefs.createRoom:
				this.createRoomResponse(data.c);

			case this.clientActionDefs.roomInvite:
				this.sendInviteResponse(data.c);

			case this.clientActionDefs.revokeInvite:
				this.revokeInviteResponse(data.c);

			case this.clientActionDefs.deleteRoom:
				this.deleteRoomResponse(data.c);
		}
	}else if(data.m !== undefined){
		//RECIEVED MESSAGE
		if(data.m.s !== undefined){
			//TYPE SERVER
			if(this.onServerMsgListener != null){
				this.onServerMsgListener(data.m.s, data.m.m) // sub-type, message
			}
		}else{
			//TYPE CHAT
			if(this.onChatMsgListener != null){
				this.onChatMsgListener(data.m.a, data.m.m); // author, message
			}
		}
	}else if(data.p !== undefined){
		//RECIEVED PRIVATE MESSAGE
		if(this.onPrivateMsgListener != null){
			this.onPrivateMsgListener(data.p.a, data.p.m); // author, message
		}
	}else if(data.l !== undefined){
		//UNEXPECTED ROOM LEAVE
		var tempRoom = this.roomName;
		this.roomName = "";
		if(this.onLeaveRoomListener != null){
			this.onLeaveRoomListener(tempRoom, null);
		}
	}else if(data.k !== undefined){
		//UNEXPECTED LOG OUT
		this.userName = "";
		this.loggedIn = false;
		this.roomName = "";
		if(this.onLogoutListener != null){
			this.onLogoutListener(true, null);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   BUILT-IN CLIENT ACTION FUNCTIONS/HANDLERS   /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// LOG IN //////////////////////////////////////////////////

GopherServerClient.prototype.login = function(userName, isGuest){
	if(userName.constructor != String || isGuest.constructor != Boolean){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.login, P: {n: userName, g: isGuest}}));
	this.guest = isGuest;
}

GopherServerClient.prototype.loginReponse = function(data){
	if(data.e !== undefined){
		this.guest = false;
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
		this.guest = false;
		this.roomName = "";
		//
		if(this.onLogoutListener != null){
			this.onLogoutListener(true, null);
		}
	}
}

// JOIN ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.joinRoom = function(roomName){
	if(roomName.constructor != String){
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
		var tempRoom = this.roomName;
		this.roomName = "";
		//
		if(this.onLeaveRoomListener != null){
			this.onLeaveRoomListener(tempRoom, null);
		}
	}
}

// CREATE A ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.createRoom = function(roomName, roomType, isPrivate, maxUsers){
	if(roomName.constructor != String || roomType.constructor != String || isPrivate.constructor != Boolean || maxUsers.constructor != Number){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.createRoom, P: {n: roomName, t: roomType, p: isPrivate, m: Math.round(maxUsers)}}));
}

GopherServerClient.prototype.createRoomResponse = function(data){
	if(data.e !== undefined){
		if(this.onCreateRoomListener != null){
			this.onCreateRoomListener("", data.e);
		}
	}else{
		//THE ROOM YOU MADE. MAKING A ROOM AUTO-JOINS THE CLIENT INTO IT.
		this.roomName = data.r;
		//
		if(this.onCreateRoomListener != null){
			this.onCreateRoomListener(data.r, null);
		}
	}
}

// DELETE A ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.deleteRoom = function(roomName){
	if(roomName.constructor != String){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.deleteRoom, P: roomName}));
}

GopherServerClient.prototype.deleteRoomResponse = function(data){
	if(data.e !== undefined){
		if(this.onDeleteRoomListener != null){
			this.onDeleteRoomListener(false, data.e);
		}
	}else{
		if(this.onDeleteRoomListener != null){
			this.onDeleteRoomListener(true, null);
		}
	}
}

// INVITE TO ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.sendInvite = function(userName){
	if(userName.constructor != String){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.roomInvite, P: userName}));
}

GopherServerClient.prototype.sendInviteResponse = function(data){
	if(data.e !== undefined){
		if(this.onInviteListener != null){
			this.onInviteListener(false, data.e);
		}
	}else{
		if(this.onInviteListener != null){
			this.onInviteListener(true, null);
		}
	}
}

// REVOKE INVITE TO ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.revokeInvite = function(userName){
	if(userName.constructor != String){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.revokeInvite, P: userName}));
}

GopherServerClient.prototype.revokeInviteResponse = function(data){
	if(data.e !== undefined){
		if(this.onRevokeListener != null){
			this.onRevokeListener(false, data.e);
		}
	}else{
		if(this.onRevokeListener != null){
			this.onRevokeListener(true, null);
		}
	}
}

// CHAT MESSAGE //////////////////////////////////////////////////

GopherServerClient.prototype.chatMessage = function(message){
	if(message.constructor != String && message.constructor != Object && message.constructor != Array){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.chatMessage, P: message}));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   OBJECT GETTERS   ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

GopherServerClient.prototype.isConnected = function(){
	return this.connected;
}

GopherServerClient.prototype.isLoggedIn = function(){
	return this.loggedIn;
}

GopherServerClient.prototype.isGuest = function(){
	return this.guest;
}

GopherServerClient.prototype.getUserName = function(){
	return this.userName;
}

GopherServerClient.prototype.getRoom = function(){
	return this.roomName;
}

GopherServerClient.prototype.getStatus = function(){
	if(this.loggedIn){
		return this.statusList[status];
	}else{
		return this.statusList[3];
	}
}

/*
"Can you feel that, huh?? Can you feel it Mr.Compost??"
   -Jim Carrey (Ace Ventura: When Nature Calls)
*/
