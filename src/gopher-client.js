var gopherClient = new GopherServerClient();

function GopherServerClient() {
	var self = this;

	// INITIAL CHECKS
	this.browserVoiceSupport = false;
	this.voiceChat = null;

	// CHECK WEBSOCKET SUPPORT
	if(!window.WebSocket){ return null; } // WebSocket is required!

	// CHECK MICROPHONE/SOUND SUPPORT
	if(navigator.mediaDevices.getUserMedia){
		this.browserVoiceSupport = true;
		if(typeof GopherVoiceChat == 'function'){
			this.voiceChat = new GopherVoiceChat();
		}
	}

	// INITIALIZE OBJECTS
	this.ip = "";
	this.port = 0;
	this.socketURL = "";
	this.ssl = false;
	this.socket = null;

	//
	this.connected = false;
	this.loggedIn = false;
	this.rememberMe = false;
	this.guest = false;
	this.userName = "";
	this.roomName = "";
	this.status = 0;
	this.friends = {};
	this.userVars = {};

	// GENERAL DEFINITIONS
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
				privateMessage: "p",
				voiceStream: "v",
				changeStatus: "sc",
				customAction: "a",
				requestFriend: "f",
				acceptFriend: "fa",
				declineFriend: "fd",
				removeFriend: "fr",
				setUserVariable: "vs",
				setUserVariables: "vx"
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
	this.serverMessageNames = [
				"Game",
				"Notice",
				"Important"
	];
	this.userStatuses = {
		available: 0,
		inGame: 1,
		idle: 2,
		offline: 3
	};
	this.userStatusDefs = [
				"Available",
				"In Game",
				"Idle",
				"Offline"
	];
	this.friendStatusDefs = {
				requested: 0,
				pending: 1,
				accepted: 2
	};

	// EVENT DEFINITIONS
	this.events = {
				signup: "onsignup",
				accountDelete: "onaccountdelete",
				passwordChange: "onpasswordchange",
				accountInfoChange: "onaccountinfochange",
				autologInit: "onautologinit",
				autologFailed: "onautologfailed",
				autologNoFile: "onautolognofile",
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
				inviteReceived: "oninvitereceived",
				chatMessage: "onchatmessage",
				privateMessage: "onprivatemessage",
				serverMessage: "onservermessage",
				data: "ondata",
				statusChanged: "onstatuschanged", // WHEN YOU CHANGE YOUR STATUS
				customAction: "oncustomaction",
				friendRequested: "onfriendrequested", // WHEN YOU REQUEST A FRIEND
				friendAccepted: "onfriendaccepted", // WHEN YOU ACCEPT A REQUEST
				friendDeclined: "onfrienddecline", // WHEN YOU DECLINE A REQUEST
				friendRemoved: "onfriendremove", // WHEN A FRIEND GETS REMOVED OR WHEN A USER DECLINES YOUR REQUEST
				friendRequestReceived: "onfriendrequestreceived", // WHEN YOU RECEIVE A FRIEND REQUEST FROM ANOTHER USER
				friendRequestAccepted: "onfriendrequestaccepted", // WHEN YOUR REQUEST TO ANOTHER USER IS ACCEPTED
				friendStatusChanged: "onfriendstatuschanged" // WHEN A FRIEND'S STATUS CHANGES
	};

	// EVENT LISTENERS
	this.onSignupListener = null;
	this.onAccountDeleteListener = null;
	this.onPasswordChangeListener = null;
	this.onAccountInfoChangeListener = null;
	this.onAutoLogInitListener = null;
	this.onAutoLogFailListener = null;
	this.onAutoLogNoFileListener = null;
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
	this.onReveiveInviteListener = null;
	this.onChatMsgListener = null;
	this.onPrivateMsgListener = null;
	this.onServerMsgListener = null;
	this.onDataListener = null;
	this.onStatusChangeListener = null;
	this.onCustomActionListener = null;
	this.onRequestFriendListener = null;
	this.onAcceptFriendListener = null;
	this.onDeclineFriendListener = null;
	this.onRemoveFriendListener = null;
	this.onFriendRequestReveivedListener = null;
	this.onFriendRequestAcceptedListener = null;
	this.onFriendStatusChangeListener = null;

	//ERROR MESSAGES
	this.paramError = "An incorrect parameter type was supplied"

	//
	return true;
}

GopherServerClient.prototype.connect = function(ip, port, ssl){
	if(ip.constructor != String || port.constructor != Number || ssl.constructor != Boolean){
		return this.paramError;
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
	self.rememberMe = false;
	self.guest = false;
	self.userName = "";
	self.roomName = "";
	self.status = 0;
	self.friends = {};

	//CALL THE DISCONNECT LISTENER
	if(self.onDisconnectListener != null){
		self.onDisconnectListener();
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
	if(type.constructor == null || type.constructor != String || callback == null || callback === undefined || callback.constructor != Function){
		return this.paramError;
	}
	if(type == this.events.signup){
		this.onSignupListener = callback;

	}else if(type == this.events.passwordChange){
		this.onPasswordChangeListener = callback;

	}else if(type == this.events.accountInfoChange){
		this.onAccountInfoChangeListener = callback;

	}else if(type == this.events.accountDelete){
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

	}else if(type == this.events.inviteReveived){
		this.onReveiveInviteListener = callback;

	}else if(type == this.events.chatMessage){
		this.onChatMsgListener = callback;

	}else if(type == this.events.privateMessage){
		this.onPrivateMsgListener = callback;

	}else if(type == this.events.serverMessage){
		this.onServerMsgListener = callback;

	}else if(type == this.events.data){
		this.onDataListener = callback;

	}else if(type == this.events.statusChanged){
		this.onStatusChangeListener = callback;

	}else if(type == this.events.customAction){
		this.onCustomActionListener = callback;

	}else if(type == this.events.friendRequested){
		this.onRequestFriendListener = callback;

	}else if(type == this.events.friendAccepted){
		this.onAcceptFriendListener = callback;

	}else if(type == this.events.friendDeclined){
		this.onDeclineFriendListener = callback;

	}else if(type == this.events.friendRemoved){
		this.onRemoveFriendListener = callback;

	}else if(type == this.events.friendRequestReveived){
		this.onFriendRequestReveivedListener = callback;

	}else if(type == this.events.friendRequestAccepted){
		this.onFriendRequestAcceptedListener = callback;

	}else if(type == this.events.friendStatusChanged){
		this.onFriendStatusChangeListener = callback;

	}else if(type == this.events.autologInit){
		this.onAutoLogInitListener = callback;

	}else if(type == this.events.autologFailed){
		this.onAutoLogFailListener = callback;

	}else if(type == this.events.autologNoFile){
		this.onAutoLogNoFileListener = callback;

	}
}

GopherServerClient.prototype.removeEventListener = function(type){
	if(type.constructor != String){
		return this.paramError;
	}
	if(type == this.events.signup){
		this.onSignupListener = null;

	}else if(type == this.events.passwordChange){
		this.onPasswordChangeListener = null;

	}else if(type == this.events.accountInfoChange){
		this.onAccountInfoChangeListener = null;

	}else if(type == this.events.accountDelete){
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

	}else if(type == this.events.inviteReveived){
		this.onReveiveInviteListener = null;

	}else if(type == this.events.chatMessage){
		this.onChatMsgListener = null;

	}else if(type == this.events.privateMessage){
		this.onPrivateMsgListener = null;

	}else if(type == this.events.serverMessage){
		this.onServerMsgListener = null;

	}else if(type == this.events.data){
		this.onDataListener = null;

	}else if(type == this.events.statusChanged){
		this.onStatusChangeListener = null;

	}else if(type == this.events.customAction){
		this.onCustomActionListener = null;

	}else if(type == this.events.friendRequested){
		this.onRequestFriendListener = null;

	}else if(type == this.events.friendAccepted){
		this.onAcceptFriendListener = null;

	}else if(type == this.events.friendDeclined){
		this.onDeclineFriendListener = null;

	}else if(type == this.events.friendRemoved){
		this.onRemoveFriendListener = null;

	}else if(type == this.events.friendRequestReveived){
		this.onFriendRequestReveivedListener = null;

	}else if(type == this.events.friendRequestAccepted){
		this.onFriendRequestAcceptedListener = null;

	}else if(type == this.events.friendStatusChanged){
		this.onFriendStatusChangeListener = null;

	}else if(type == this.events.autologInit){
		this.onAutoLogInitListener = null;

	}else if(type == this.events.autologFailed){
		this.onAutoLogFailListener = null;

	}else if(type == this.events.autologNoFile){
		this.onAutoLogNoFileListener = null;

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
		//RECEIVED DATA (high look-up priority)
		if(this.onDataListener != null){
			this.onDataListener(data.d);
		}
	}else if(data.a !== undefined){
		//CUSTOM CLIENT ACTION RESPONSE
		this.customClientActionResponse(data.a);
	}else if(data.c !== undefined){
		//BUILT-IN CLIENT ACTION RESPONSES
		if(data.c.a == this.clientActionDefs.setUserVariable){
			this.setUserVariableReceived(data.c);
		}else if(data.c.a == this.clientActionDefs.setUserVariables){
			this.setUserVariablesReceived(data.c);
		}else if(data.c.a == this.clientActionDefs.signup){
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
		}else if(data.c.a == this.clientActionDefs.requestFriend){
			this.requestFriendReveived(data.c);
		}else if(data.c.a == this.clientActionDefs.acceptFriend){
			this.acceptFriendReveived(data.c);
		}else if(data.c.a == this.clientActionDefs.declineFriend){
			this.declineFriendReveived(data.c);
		}else if(data.c.a == this.clientActionDefs.removeFriend){
			this.removeFriendReveived(data.c);
		}else if(data.c.a == this.clientActionDefs.changeStatus){
			this.changeStatusReveived(data.c);
		}
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
		//RECEIVED ROOM MESSAGE
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
		//RECEIVED PRIVATE MESSAGE
		if(this.onPrivateMsgListener != null){
			this.onPrivateMsgListener(data.p.f, data.p.t, data.p.m); // from, to, message
		}
	}else if(data.i !== undefined){
		//RECEIVED INVITATION TO ROOM
		if(this.onReveiveInviteListener != null){
			this.onReveiveInviteListener(data.i.u, data.i.r); // userName, roomName
		}
	}else if(data.f !== undefined){
		//RECEIVED FRIEND REQUEST
		this.friends[data.f.n] = {name: data.f.n, requestStatus: this.friendStatusDefs.requested, status: -1};
		if(this.onFriendRequestReveivedListener != null){
			this.onFriendRequestReveivedListener(data.f.n); // userName
		}
	}else if(data.fa !== undefined){
		//FRIEND REQUEST WAS ACCEPTED
		if(this.friends[data.fa.n] != undefined){
			this.friends[data.fa.n].requestStatus = this.friendStatusDefs.accepted;
			this.friends[data.fa.n].status = data.fa.s;
		}else{
			this.friends[data.fa.n] = {name: data.fa.n, requestStatus: this.friendStatusDefs.accepted, status: data.fa.s};
		}
		if(this.onFriendRequestAcceptedListener != null){
			this.onFriendRequestAcceptedListener(data.fa.n); // userName
		}
	}else if(data.fr !== undefined){
		//FRIEND WAS REMOVED
		if(this.friends[data.fr.n] != undefined){
			delete this.friends[data.fr.n];
		}
		if(this.onRemoveFriendListener != null){
			this.onRemoveFriendListener(data.fr.n); // userName
		}
	}else if(data.fs !== undefined){
		//FRIEND'S STATUS CHANGED
		if(this.friends[data.fs.n] != undefined){
			this.friends[data.fs.n].status = data.fs.s;
		}else{
			this.friends[data.fs.n] = {name: data.fs.n, requestStatus: this.friendStatusDefs.accepted, status: data.fs.s};
		}
		if(this.onFriendStatusChangeListener != null){
			this.onFriendStatusChangeListener(data.fs.n, data.fs.s); // userName, status
		}
	}else if(data.t !== undefined){
		//SERVER REQUESTED AUTO-LOG INFO
		if(this.onAutoLogInitListener != null){
			this.onAutoLogInitListener();
		}
		if(localStorage.getItem('dt')){
			if(localStorage.getItem('da') && localStorage.getItem('di')){
				this.socket.send(JSON.stringify({A: "2", P: {dt: localStorage.getItem('dt'), da: localStorage.getItem('da'),
													di: localStorage.getItem('di')}}));
			}else{
				this.socket.send(JSON.stringify({A: "1", P: localStorage.getItem('dt')}));
			}
		}else{
			this.socket.send(JSON.stringify({A: "0", P: null}));
		}
	}else if(data.ts !== undefined){
		//SERVER WANTS TO SET DEVICE TAG
		localStorage.setItem('dt', data.ts);
		this.socket.send(JSON.stringify({A: "1", P: localStorage.getItem('dt')}));
	}else if(data.ap !== undefined){
		//SERVER WANTS TO SET DEVICE PASS
		this.socket.send(JSON.stringify({A: "3", P: null}));
		localStorage.setItem('da', data.ap);
	}else if(data.af !== undefined){                             //// REMEMBER, AUTO-LOGIN TRIGGERS onLoginListener IF SUCCESSFUL.
		//AUTO-LOGIN FAILED
		localStorage.clear();
		localStorage.setItem('dt', data.af.dt);
		if(this.onAutoLogFailListener != null){
			this.onAutoLogFailListener(data.af.e);
		}
	}else if(data.ai !== undefined){
		//AUTO-LOGIN NOT FILED
		if(this.onAutoLogNoFileListener != null){
			this.onAutoLogNoFileListener();
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   BUILT-IN CLIENT ACTION FUNCTIONS/HANDLERS   /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   ACCOUNT ACTIONS   ///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// SIGN UP //////////////////////////////////////////////////

GopherServerClient.prototype.signup = function(userName, password, customCols){
	if(userName == null || password == null || userName.constructor != String ||
			password.constructor != String || (customCols != null && customCols.constructor != Object)){
		return this.paramError;
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
	if(userName == null || password == null || userName.constructor != String ||
			password.constructor != String || (customCols != null && customCols.constructor != Object)){
		return this.paramError;
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
	}else if(password == null || password.constructor != String || customCols == null || customCols.constructor != Object){
		return this.paramError;
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

GopherServerClient.prototype.changePassword = function(password, newPassword, customCols){
	if(!this.loggedIn){
		return "You must be logged in to change your password";
	}
	if(password == null || newPassword == null || password.constructor != String ||
			newPassword.constructor != String || (customCols != null && customCols.constructor != Object)){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.changePassword, P: {p: password, n: newPassword, c:customCols}}));
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

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   LOGIN/LOGOUT ACTIONS   //////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// LOG IN //////////////////////////////////////////////////

GopherServerClient.prototype.login = function(userName, password, rememberMe, isGuest, customCols){
	if(userName == null || userName.constructor != String || (isGuest != null && isGuest.constructor != Boolean) || (rememberMe != null && rememberMe.constructor != Boolean)
			|| (password != null && password.constructor != String) || (customCols != null && customCols.constructor != Object)){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.login, P: {n: userName, p: password, g: isGuest, r: rememberMe, c: customCols}}));
	this.guest = isGuest;
	if(rememberMe == null){
		this.rememberMe = false;
	}else{
		this.rememberMe = rememberMe;
	}
}

GopherServerClient.prototype.loginReponse = function(data){
	if(data.e !== undefined){
		this.guest = false;
		if(this.onLoginListener != null){
			this.onLoginListener("", data.e);
		}
	}else{
		this.userName = data.r.n;
		this.loggedIn = true;
		//MAKE FRIENDS
		var fList = data.r.f;
		if(fList != undefined && fList != null){
			for(var i = 0; i < fList.length; i++){
				var status = -1;
				if(fList[i]["s"] != undefined){
					status = fList[i]["s"];
				}
				this.friends[fList[i]["n"]] = {name: fList[i]["n"], requestStatus: fList[i]["rs"], status: status};
			}
		}
		//SET AUTO-LOG IF PROVIDED
		if(data.r.ap && this.rememberMe){
			localStorage.setItem('da', data.r.ap);
			localStorage.setItem('di', data.r.ai);
		}
		//
		if(this.onLoginListener != null){
			this.onLoginListener(this.userName, null);
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
		this.status = 0;
		this.friends = {};
		//UN-SET AUTO-LOG IF SET
		if(localStorage.getItem('da')){
			localStorage.removeItem("da");
			localStorage.removeItem("di");
		}
		//
		if(this.onLogoutListener != null){
			this.onLogoutListener(true, null);
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   ROOM ACTIONS   //////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// JOIN ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.joinRoom = function(roomName){
	if(roomName == null || roomName.constructor != String){
		return this.paramError;
	}
	this.roomName = roomName;
	this.socket.send(JSON.stringify({A: this.clientActionDefs.joinRoom, P: roomName}));
}

GopherServerClient.prototype.joinRoomResponse = function(data){
	if(data.e !== undefined){
		this.roomName = "";
		if(this.onJoinRoomListener != null){
			this.onJoinRoomListener("", data.e);
		}
	}else{
		if(this.onJoinRoomListener != null && this.onJoinRoomListener != null){
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
			this.onLeaveRoomListener("", data.e);
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
	if(roomName == null || roomType == null || isPrivate == null || maxUsers == null ||
			roomName.constructor != String || roomType.constructor != String || isPrivate.constructor != Boolean || maxUsers.constructor != Number){
		return this.paramError;
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
	if(roomName == null || roomName.constructor != String){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.deleteRoom, P: roomName}));
}

GopherServerClient.prototype.deleteRoomResponse = function(data){
	if(data.e !== undefined){
		if(this.onDeleteRoomListener != null){
			this.onDeleteRoomListener("", data.e);
		}
	}else{
		if(this.onDeleteRoomListener != null){
			this.onDeleteRoomListener(data.r, null);
		}
	}
}

// INVITE TO ROOM //////////////////////////////////////////////////

GopherServerClient.prototype.sendInvite = function(userName){
	if(userName == null || userName.constructor != String){
		return this.paramError;
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
	if(userName == null || userName.constructor != String){
		return this.paramError;
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

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   MESSAGING   /////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// CHAT MESSAGE //////////////////////////////////////////////////

GopherServerClient.prototype.chatMessage = function(message){
	if(message == null || (message.constructor != String && message.constructor != Object && message.constructor != Array)){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.chatMessage, P: message}));
}

// PRIVATE MESSAGE //////////////////////////////////////////////////

GopherServerClient.prototype.privateMessage = function(userName, message){
	if(message == null || userName == null || userName.constructor != String ||
			(message.constructor != String && message.constructor != Object && message.constructor != Array)){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.privateMessage, P: {u: userName, m: message}}));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   CUSTOM ACTIONS   ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// CUSTOM CLIENT ACTION //////////////////////////////////////////////////

GopherServerClient.prototype.customClientAction = function(action, data){
	if(action.constructor != String || (data.constructor != null && data.constructor != Boolean && data.constructor != Number
			&& data.constructor != String && data.constructor != Array && data.constructor != Object)){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.customAction, P: {a: action, d: data}}));
}

GopherServerClient.prototype.customClientActionResponse = function(data){
	if(data.e !== undefined){
		if(this.onCustomActionListener != null){
			this.onCustomActionListener(null, data.a, data.e); // responseData, actionType, error
		}
	}else{
		if(this.onCustomActionListener != null){
			this.onCustomActionListener(data.r, data.a, null); // responseData, actionType, error
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   FRIENDING ACTIONS   /////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// REQUEST A FRIEND //////////////////////////////////////////////////

GopherServerClient.prototype.requestFriend = function(friendName){
	if(friendName == null || friendName.constructor != String){
		return this.paramError;
	}else if(this.friends[friendName] != undefined){
		return "You cannot request '"+friendName+"' as a friend at this time";
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.requestFriend, P: friendName}));
}

GopherServerClient.prototype.requestFriendReveived = function(data){
	if(data.e !== undefined){
		if(this.onRequestFriendListener != null){
			this.onRequestFriendListener("", data.e); // friendName, error
		}
	}else{
		//ADD FRIEND
		this.friends[data.r] = {name: data.r, requestStatus: this.friendStatusDefs.pending, status: -1};
		//
		if(this.onRequestFriendListener != null){
			this.onRequestFriendListener(data.r, null); // friendName, error
		}
	}
}

// ACCEPT A FRIEND REQUEST //////////////////////////////////////////////////

GopherServerClient.prototype.acceptFriend = function(friendName){
	if(friendName == null || friendName.constructor != String){
		return this.paramError;
	}else if(this.friends[friendName] == undefined){
		return "No friend by the name '"+friendName+"'";
	}else if(this.friends[friendName].requestStatus != this.friendStatusDefs.requested){
		return "Cannot accept '"+friendName+"' as a friend";
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.acceptFriend, P: friendName}));
}

GopherServerClient.prototype.acceptFriendReveived = function(data){
	if(data.e !== undefined){
		if(this.onAcceptFriendListener != null){
			this.onAcceptFriendListener("", data.e); // friendName, error
		}
	}else{
		//UPDATE/ADD FRIEND
		if(this.friends[data.r.n] != undefined){
			this.friends[data.r.n].requestStatus = this.friendStatusDefs.accepted;
			this.friends[data.r.n].status = data.r.s;
		}else{
			this.friends[data.r.n] = {name: data.r.n, requestStatus: this.friendStatusDefs.accepted, status: data.r.s};
		}
		//
		if(this.onAcceptFriendListener != null){
			this.onAcceptFriendListener(data.r.n, null); // friendName, error
		}
	}
}

// DECLINE A FRIEND REQUEST //////////////////////////////////////////////////

GopherServerClient.prototype.declineFriend = function(friendName){
	if(friendName == null || friendName.constructor != String){
		return this.paramError;
	}else if(this.friends[friendName] == undefined){
		return "No friend by the name '"+friendName+"'";
	}else if(this.friends[friendName].requestStatus != this.friendStatusDefs.requested){
		return "Cannot decline '"+friendName+"' as a friend";
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.declineFriend, P: friendName}));
}

GopherServerClient.prototype.declineFriendReveived = function(data){
	if(data.e !== undefined){
		if(this.onDeclineFriendListener != null){
			this.onDeclineFriendListener("", data.e); // friendName, error
		}
	}else{
		//
		if(this.onDeclineFriendListener != null){
			this.onDeclineFriendListener(data.r, null); // friendName, error
		}
		//REMOVE FRIEND
		if(this.friends[data.r] != undefined){
			delete this.friends[data.r];
		}
	}
}

// REMOVE A FRIEND //////////////////////////////////////////////////

GopherServerClient.prototype.removeFriend = function(friendName){
	if(friendName == null || friendName.constructor != String){
		return this.paramError;
	}else if(this.friends[friendName] == undefined){
		return "No friend by the name '"+friendName+"'";
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.removeFriend, P: friendName}));
}

GopherServerClient.prototype.removeFriendReveived = function(data){
	if(data.e !== undefined){
		if(this.onRemoveFriendListener != null){
			this.onRemoveFriendListener("", data.e); // friendName, error
		}
	}else{
		//
		if(this.onRemoveFriendListener != null){
			this.onRemoveFriendListener(data.r, null); // friendName, error
		}
		//REMOVE FRIEND
		if(this.friends[data.r] != undefined){
			delete this.friends[data.r];
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   CHANGING STATUS   ///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// CHANGE YOUR STATUS //////////////////////////////////////////////////

GopherServerClient.prototype.changeStatus = function(status){
	if(status == null || status.constructor != Number || status < 0){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.changeStatus, P: Math.round(status)}));
}

GopherServerClient.prototype.changeStatusReveived = function(data){
	if(data.e !== undefined){
		if(this.onStatusChangeListener != null){
			this.onStatusChangeListener(0, data.e); // status, error
		}
	}else{
		//CHANGE STATUS
		this.status = data.r;
		//
		if(this.onStatusChangeListener != null){
			this.onStatusChangeListener(data.r, null); // status, error
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   USER VARIABLES   ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// SET USER VARIABLE //////////////////////////////////////////////////

GopherServerClient.prototype.setUserVariable = function(key, value){
	if(key == undefined || key.constructor != String){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.setUserVariable, P: {k:key, v: value}}));
}

GopherServerClient.prototype.setUserVariableReceived = function(data){
	this.userVars[data.r.k] = data.r.v;
}

// SET MULTIPLE USER VARIABLES //////////////////////////////////////////////////

GopherServerClient.prototype.setUserVariables = function(values){
	if(values == null || values.constructor != Object){
		return this.paramError;
	}
	this.socket.send(JSON.stringify({A: this.clientActionDefs.setUserVariables, P: values}));
}

GopherServerClient.prototype.setUserVariablesReceived = function(data){
	var keys = Object.keys(data.r);
	for(var i = 0; i < keys.length; i++){
		this.userVars[keys[i]] = data.r[keys[i]];
	}
}

// USER VARIABLE GETTER //////////////////////////////////////////////////

GopherServerClient.prototype.getUserVariable = function(key){
	return this.userVars[key];
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//   OBJECT GETTERS   ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// isConnected returns a boolean that's true if the client is connected
GopherServerClient.prototype.isConnected = function(){
	return this.connected;
}

// isLoggedIn returns a boolean that's true if the client is logged in as a User
GopherServerClient.prototype.isLoggedIn = function(){
	return this.loggedIn;
}

// isGuest returns a boolean that's true if the client is a guest
GopherServerClient.prototype.isGuest = function(){
	return this.guest;
}

// getUserName returns the name of the User the client is currently logged in as. A blank string is returned
// if the client is not logged in.
GopherServerClient.prototype.getUserName = function(){
	return this.userName;
}

// getRoom returns the name of the Room the client User is currently in. A blank string is returned
// if the client User is not in a room.
GopherServerClient.prototype.getRoom = function(){
	return this.roomName;
}

// getFriends returns the client User's friends as an array of strings. An empty array is returned
// if the client User has no friends.
GopherServerClient.prototype.getFriends = function(){
	return this.friends;
}

// getStatus returns the client User's status.
GopherServerClient.prototype.getStatus = function(){
	return this.status;
}

// statusName converts a status number into the name of the status as a string ("Available", "In Game",
// "Idle", and "Offline").
GopherServerClient.prototype.statusName = function(status){
	if(status == undefined || status == null || status.constructor != Number || status < 0 || status > this.userStatusDefs.length-1){
		return undefined;
	}
	return this.userStatusDefs[status];
}

// voiceSupport returns true if the client's browser supports the voice chat features.
GopherServerClient.prototype.voiceSupport = function(){
	return this.browserVoiceSupport;
}
