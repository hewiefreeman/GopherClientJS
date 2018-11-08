var gopherClient = new GopherServerClient();

function GopherServerClient() {
	var self = this;

	//INITIAL CHECKS
	this.browserVoiceSupport = true;
	this.voiceChat = null;

	//CHECK WEBSOCKET SUPPORT
	if(!window.WebSocket){ return null; } // WebSocket is required!

	//CHECK MICROPHONE/SOUND SUPPORT
	if(navigator.mediaDevices.getUserMedia){
		this.voiceChat = new GopherVoiceChat();
	}else{
		this.browserVoiceSupport = false;
	}

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
	this.friends = [];

	//DEFINITIONS
	this.statusList = ["Available", "In Game", "Idle", "Offline"];
	this.clientActionDefs = {
						signup: "s",
						deleteAccount: "d",
						changePassword: "pc",
						changeAccountInfo: "ic",
						login: "li",
						logout: "lo",
						joinRoom: "j",
						leaveRoom: "lr",
						createRoom: "r",
						deleteRoom: "rd",
						roomInvite: "i",
						revokeInvite: "ri",
						chatMessage: "c",
						voiceStream: "v",
						customAction: "a",
						friendRequest: "f",
						acceptFriend: "fa",
						declineFriend: "fd",
						removeFriend: "fr"
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
				signup: "onsignup",
				accountDelete: "onaccountdelete",
				passwordChange: "onpasswordchange",
				accountInfoChange: "onaccountinfochange",
				login: "onlogin",
				logout: "onlogout",
				connected: "onconnect",
				disconnected: "ondisconnect",
				joined: "onjoinroom",
				left: "onleaveroom",
				userJoined: "onuserjoin",
				userLeft: "onuserleft",
				roomCreate: "oncreateroom",
				roomDelete: "ondeleteroom",
				invited: "oninvite",
				inviteRevoked: "onrevokeinvite",
				inviteRecieved: "oninviterecieved",
				chatMessage: "onchatmessage",
				privateMessage: "onprivatemessage",
				serverMessage: "onservermessage",
				data: "ondata",
				customAction: "oncustomaction",
				friendRequested: "onfriendrequested", // WHEN YOU REQUEST A FRIEND
				friendAccepted: "onfriendaccepted", // WHEN YOU ACCEPT A REQUEST
				friendDeclined: "onfrienddecline", // WHEN YOU DECLINE A REQUEST
				friendRemoved: "onfriendremove", // WHEN A FRIEND GETS REMOVED OR WHEN A USER DECLINES YOUR REQUEST
				friendRequestRecieved: "onfriendrequestrecieved", // WHEN YOU RECIEVE A FRIEND REQUEST FROM ANOTHER USER
				friendRequestAccepted: "onfriendrequestaccpted", // WHEN YOUR REQUEST TO ANOTHER USER IS ACCEPTED
				};
	this.onSignupListener = null;
	this.onAccountDeleteListener = null;
	this.onPasswordChangeListener = null;
	this.onAccountInfoChangeListener = null;
	this.onLoginListener = null;
	this.onLogoutListener = null;
	this.onConnectListener = null;
	this.onDisconnectListener = null;
	this.onJoinRoomListener = null;
	this.onLeaveRoomListener = null;
	this.onUserJoinListener = null;
	this.onUserLeaveListener = null;
	this.onCreateRoomListener = null;
	this.onDeleteRoomListener = null;
	this.onInviteListener = null;
	this.onRevokeListener = null;
	this.onRecieveInviteListener = null;
	this.onChatMsgListener = null;
	this.onPrivateMsgListener = null;
	this.onServerMsgListener = null;
	this.onDataListener = null;
	this.onCustomActionListener = null;

	//ERROR MESSAGES
	this.paramError = "An incorrect parameter type was supplied"

	//
	return true;
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
	self.onSignupListener = null;
	self.onAccountDeleteListener = null;
	self.onPasswordChangeListener = null;
	self.onAccountInfoChangeListener = null;
	self.onLoginListener = null;
	self.onLogoutListener = null;
	self.onConnectListener = null;
	self.onJoinRoomListener = null;
	self.onLeaveRoomListener = null;
	self.onUserJoinListener = null;
	self.onUserLeaveListener = null;
	self.onCreateRoomListener = null;
	self.onDeleteRoomListener = null;
	self.onInviteListener = null;
	self.onRevokeListener = null;
	self.onRecieveInviteListener = null;
	self.onChatMsgListener = null;
	self.onPrivateMsgListener = null;
	self.onServerMsgListener = null;
	self.onDataListener = null;
	self.onCustomActionListener = null;

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
	if(type == this.events.signup){
		this.onSignupListener = callback;

	}else if(type == this.events.passwordChange){
		this.onPasswordChangeListener = callback;

	}else if(type == this.events.accountInfoChange){
		this.onAccountInfoChangeListener = callback;

	}else if(type == this.events.deleteAccount){
		this.onAccountDeleteListener = callback;

	}else if(type == this.events.login){
		this.onLoginListener = callback;

	}else if(type == this.events.logout){
		this.onLogoutListener = callback;

	}else if(type == this.events.connected){
		this.onConnectListener = callback;

	}else if(type == this.events.disconnected){
		this.onDisconnectListener = callback;

	}else if(type == this.events.joined){
		this.onJoinRoomListener = callback;

	}else if(type == this.events.left){
		this.onLeaveRoomListener = callback;

	}else if(type == this.events.userJoined){
		this.onUserJoinListener = callback;

	}else if(type == this.events.userLeft){
		this.onUserLeaveListener = callback;

	}else if(type == this.events.roomCreate){
		this.onCreateRoomListener = callback;

	}else if(type == this.events.roomDelete){
		this.onDeleteRoomListener = callback;

	}else if(type == this.events.invited){
		this.onInviteListener = callback;

	}else if(type == this.events.inviteRevoked){
		this.onRevokeListener = callback;

	}else if(type == this.events.inviteRecieved){
		this.onRecieveInviteListener = callback;

	}else if(type == this.events.chatMessage){
		this.onChatMsgListener = callback;

	}else if(type == this.events.privateMessage){
		this.onPrivateMsgListener = callback;

	}else if(type == this.events.serverMessage){
		this.onServerMsgListener = callback;

	}else if(type == this.events.data){
		this.onDataListener = callback;

	}else if(type == this.events.customAction){
		this.onCustomActionListener = callback;

	}
}

GopherServerClient.prototype.removeEventListener = function(type){
	if(type.constructor != String){
		return paramError;
	}
	if(type == this.events.signup){
		this.onSignupListener = null;

	}else if(type == this.events.passwordChange){
		this.onPasswordChangeListener = null;

	}else if(type == this.events.accountInfoChange){
		this.onAccountInfoChangeListener = null;

	}else if(type == this.events.deleteAccount){
		this.onAccountDeleteListener = null;

	}else if(type == this.events.login){
		this.onLoginListener = null;

	}else if(type == this.events.logout){
		this.onLogoutListener = null;

	}else if(type == this.events.connected){
		this.onConnectListener = null;

	}else if(type == this.events.disconnected){
		this.onDisconnectListener = null;

	}else if(type == this.events.joined){
		this.onJoinRoomListener = null;

	}else if(type == this.events.left){
		this.onLeaveRoomListener = null;

	}else if(type == this.events.userJoined){
		this.onUserJoinListener = null;

	}else if(type == this.events.userLeft){
		this.onUserLeaveListener = null;

	}else if(type == this.events.roomCreate){
		this.onCreateRoomListener = null;

	}else if(type == this.events.roomDelete){
		this.onDeleteRoomListener = null;

	}else if(type == this.events.invited){
		this.onInviteListener = null;

	}else if(type == this.events.inviteRevoked){
		this.onRevokeListener = null;

	}else if(type == this.events.inviteRecieved){
		this.onRecieveInviteListener = null;

	}else if(type == this.events.chatMessage){
		this.onChatMsgListener = null;

	}else if(type == this.events.privateMessage){
		this.onPrivateMsgListener = null;

	}else if(type == this.events.serverMessage){
		this.onServerMsgListener = null;

	}else if(type == this.events.data){
		this.onDataListener = null;

	}else if(type == this.events.customAction){
		this.onCustomActionListener = null;

	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   SOCKET MESSAGE HANDLER   ////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

GopherServerClient.prototype.sRhandle = function(data){
	if(data.v !== undefined){
		//VOICE STREAM (highest look-up priority)
		this.voiceChat.rD(data.v);
	}if(data.vp !== undefined){
		//VOICE PING (high look-up priority)
		this.voiceChat.pD();
	}else if(data.d !== undefined){
		//RECIEVED DATA (high look-up priority)
		if(this.onDataListener != null){
			this.onDataListener(data.d);
		}
	}else if(data.c !== undefined){
		//BUILT-IN CLIENT ACTION RESPONSES
		if(data.c.a == this.clientActionDefs.signup){
			this.signupResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.deleteAccount){
			this.deleteAccountResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.changeAccountInfo){
			this.changeAccountInfoResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.changePassword){
			this.changePasswordResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.login){
			this.loginReponse(data.c);
		}else if(data.c.a == this.clientActionDefs.logout){
			this.logoutReponse(data.c);
		}else if(data.c.a == this.clientActionDefs.joinRoom){
			this.joinRoomResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.leaveRoom){
			this.leaveRoomResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.createRoom){
			this.createRoomResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.roomInvite){
			this.sendInviteResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.revokeInvite){
			this.revokeInviteResponse(data.c);
		}else if(data.c.a == this.clientActionDefs.deleteRoom){
			this.deleteRoomResponse(data.c);
		}
	}else if(data.a !== undefined){
		//CUSTOM CLIENT ACTION RESPONSE
		this.customClientActionResponse(data.a);
	}else if(data.e !== undefined){
		//USER ENTERED ROOM
		if(this.onUserJoinListener != null){
			this.onUserJoinListener(data.e.u, data.e.g); // userName, isGuest
		}
	}else if(data.x !== undefined){
		//USER EXITED ROOM
		if(this.onUserLeaveListener != null){
			this.onUserLeaveListener(data.x.u); // userName
		}
	}else if(data.m !== undefined){
		//RECIEVED ROOM MESSAGE
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
	}else if(data.i !== undefined){
		//RECIEVED INVITATION TO ROOM
		if(this.onRecieveInviteListener != null){
			this.onRecieveInviteListener(data.i.u, data.i.r); // userName, roomName
		}
	}else if(data.f !== undefined){
		//RECIEVED FRIEND REQUEST
	}else if(data.fa !== undefined){
		//FRIEND REQUEST WAS ACCEPTED
	}else if(data.fr !== undefined){
		//FRIEND WAS REMOVED
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   BUILT-IN CLIENT ACTION FUNCTIONS/HANDLERS   /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// SIGN UP //////////////////////////////////////////////////

GopherServerClient.prototype.signup = function(userName, password, customCols){
	if(userName.constructor != String || password.constructor != String || (customCols != null && customCols.constructor != Object)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.signup, P: {n: userName, p: password, c:customCols}}));
}

GopherServerClient.prototype.signupResponse = function(data){
	if(data.e !== undefined){
		if(this.onSignupListener != null){
			this.onSignupListener(false, data.e);
		}
	}else{
		if(this.onSignupListener != null){
			this.onSignupListener(true, null);
		}
	}
}

// DELETE AN ACCOUNT //////////////////////////////////////////////////

GopherServerClient.prototype.deleteAccount = function(userName, password, customCols){
	if(userName.constructor != String || password.constructor != String || (customCols != null && customCols.constructor != Object)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.deleteAccount, P: {n: userName, p: password, c:customCols}}));
}

GopherServerClient.prototype.deleteAccountResponse = function(data){
	if(data.e !== undefined){
		if(this.onAccountDeleteListener != null){
			this.onAccountDeleteListener(false, data.e);
		}
	}else{
		if(this.onAccountDeleteListener != null){
			this.onAccountDeleteListener(true, null);
		}
	}
}

// CHANGE ACCOUNT INFO //////////////////////////////////////////////////

GopherServerClient.prototype.changeAccountInfo = function(password, customCols){
	if(!this.loggedIn){
		return "You must be logged in to change your account info";
	}
	if(password.constructor != String || (customCols != null && customCols.constructor != Object)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.changeAccountInfo, P: {p: password, c:customCols}}));
}

GopherServerClient.prototype.changeAccountInfoResponse = function(data){
	if(data.e !== undefined){
		if(this.onAccountInfoChangeListener != null){
			this.onAccountInfoChangeListener(false, data.e);
		}
	}else{
		if(this.onAccountInfoChangeListener != null){
			this.onAccountInfoChangeListener(true, null);
		}
	}
}

// CHANGE PASSWORD //////////////////////////////////////////////////

GopherServerClient.prototype.changePassword = function(password, customCols){
	if(!this.loggedIn){
		return "You must be logged in to change your password";
	}
	if(password.constructor != String || (customCols != null && customCols.constructor != Object)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.changePassword, P: {p: password, c:customCols}}));
}

GopherServerClient.prototype.changePasswordResponse = function(data){
	if(data.e !== undefined){
		if(this.onPasswordChangeListener != null){
			this.onPasswordChangeListener(false, data.e);
		}
	}else{
		if(this.onPasswordChangeListener != null){
			this.onPasswordChangeListener(true, null);
		}
	}
}

// LOG IN //////////////////////////////////////////////////

GopherServerClient.prototype.login = function(userName, isGuest, password, customCols){
	if(userName.constructor != String || isGuest.constructor != Boolean || (password != null && password.constructor != String)
			|| (customCols != null && customCols.constructor != Object)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.login, P: {n: userName, p: password, g: isGuest, c: customCols}}));
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

// CUSTOM CLIENT ACTION //////////////////////////////////////////////////

GopherServerClient.prototype.customClientAction = function(action, data){
	if(action.constructor != String || (data.constructor != null && data.constructor != Boolean && data.constructor != Number
			&& data.constructor != String && data.constructor != Array && data.constructor != Object)){
		return paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.customAction, P: {a: action, d: data}}));
}

GopherServerClient.prototype.customClientActionResponse = function(data){
	if(data.e !== undefined){
		if(this.onCustomActionListener != null){
			this.onCustomActionListener(null, null, data.e); // responseData, actionType, error
		}
	}else{
		if(this.onCustomActionListener != null){
			this.onCustomActionListener(data.r, data.a, null); // responseData, actionType, error
		}
	}
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

GopherServerClient.prototype.voiceSupport = function(){
	return this.browserVoiceSupport;
}

/*
"Can you feel that, huh?? Can you feel it Mr.Compost??"
   -Jim Carrey (Ace Ventura: When Nature Calls)
*/
