gopherClient.connect("localhost", 8080, false, connected, disconnected);

function connected(){
	console.log("connected!");
	gopherClient.login("Hello Kitty", true, onLogin);
}

function disconnected(){
	console.log("DISCONNECTED!");
}

function onLogin(success, error){
	if(success){
		console.log("Login success!");
		gopherClient.joinRoom("Hello Kitty Island Adventures");
	}else{
		console.log(error)
	}
}
