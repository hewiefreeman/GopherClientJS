var gc = null;
window.onload = loaded;

function loaded(e){
	gc = gopherClient;

	//SERVER CONNECTION LISTENERS
	gc.addEventListener(gc.events.connected, connected);
	gc.addEventListener(gc.events.disconnected, disconnected);
	//SIGNUP/LOGIN LISTENERS
	gc.addEventListener(gc.events.login, onLogin);
	//gc.addEventListener(gc.events.logout, onLogout);
	//FRIEND LISTENERS
	gc.addEventListener(gc.events.friendRequested, onRequestFriend);// WHEN YOU REQUEST A FRIEND
	gc.addEventListener(gc.events.friendAccepted, onAcceptFriend);// WHEN YOU ACCEPT A REQUEST
	gc.addEventListener(gc.events.friendDeclined, onDeclineFriend);// WHEN YOU DECLINE A REQUEST
	gc.addEventListener(gc.events.friendRemoved, onRemoveFriend);// WHEN A FRIEND GETS REMOVED OR WHEN A USER DECLINES YOUR REQUEST
	gc.addEventListener(gc.events.friendRequestRecieved, onRecieveFriendRequest);// WHEN YOU RECIEVE A FRIEND REQUEST FROM ANOTHER USER
	gc.addEventListener(gc.events.friendRequestAccepted, onRecieveFriendAccept);// WHEN YOUR REQUEST TO ANOTHER USER IS ACCEPTED
	gc.addEventListener(gc.events.friendStatusChanged, onFriendStatusChange);// WHEN A FRIEND'S STATUS CHANGES
	gc.addEventListener(gc.events.statusChanged, onStatusChange);
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

	//SEND REQUEST
	document.getElementById("requestBtn").onclick = function(){
		if(gc.isLoggedIn){
			var friend = document.getElementById("requestText").value;
			gc.requestFriend(friend);
		}else{
			console.log("Must be logged in to request a friend")
		}
	};

	//ACCEPT REQUEST
	document.getElementById("acceptBtn").onclick = function(){
		if(gc.isLoggedIn){
			var friend = document.getElementById("acceptText").value;
			gc.acceptFriend(friend);
		}else{
			console.log("Must be logged in to accept a friend")
		}
	};

	//DECLINE REQUEST
	document.getElementById("declineBtn").onclick = function(){
		if(gc.isLoggedIn){
			var friend = document.getElementById("declineText").value;
			gc.declineFriend(friend);
		}else{
			console.log("Must be logged in to decline a friend")
		}
	};

	//REMOVE FRIEND
	document.getElementById("removeBtn").onclick = function(){
		if(gc.isLoggedIn){
			var friend = document.getElementById("removeText").value;
			gc.removeFriend(friend);
		}else{
			console.log("Must be logged in to remove a friend")
		}
	};

	//CHANGE USER STATUS
	document.getElementById("statusSelect").onchange = function() {
		//change the tag innerHTML checking the selected value of the select
		var status = parseInt(document.getElementById("statusSelect").value);
		gc.changeStatus(status);
	}
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


//////////////////  REQUESTED FRIEND  //////////////////////////////
function onRequestFriend(friendName, error){
	if(error != null){
		console.log("Error: "+error);
	}else{
		console.log("Sent friend request to: "+friendName);
	}
}

//////////////////  ACCEPTED FRIEND  //////////////////////////////
function onAcceptFriend(friendName, error){
	if(error != null){
		console.log("Error: "+error);
	}else{
		console.log("Accepted "+friendName+" as a friend");
	}
}

//////////////////  DECLINED FRIEND  //////////////////////////////
function onDeclineFriend(friendName, error){
	if(error != null){
		console.log("Error: "+error);
	}else{
		console.log("Declined "+friendName+" as a friend");
	}
}

//////////////////  DECLINED FRIEND  //////////////////////////////
function onRemoveFriend(friendName, error){
	if(error != null){
		console.log("Error: "+error);
	}else{
		console.log(friendName+" was removed from your friends list");
	}
}

//////////////////  STATUS CHANGE  //////////////////////////////
function onStatusChange(status, error){
	if(error != null){
		console.log("Error: "+error);
	}else{
		console.log("Changed your status to '"+gc.statusName(status)+"'");
	}
}

//////////////////  RECIEVED FRIEND REQUEST  //////////////////////////////
function onRecieveFriendRequest(friendName){
	console.log("Recieved friend request from: "+friendName);
}

//////////////////  RECIEVED FRIEND REQUEST ACCEPT  //////////////////////////////
function onRecieveFriendAccept(friendName){
	console.log(friendName+" accepted your friend request");
}

//////////////////  FRIEND STATUS CHANGE  //////////////////////////////
function onFriendStatusChange(friendName, status){
	console.log(friendName+" changed their status to '"+gc.statusName(status)+"'");
}
