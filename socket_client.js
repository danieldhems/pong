var socket = io("http://localhost:3000");

socket.on("waiting", function(data){
	console.log(data);
});

socket.on("ready", function(data){
	console.log(data);
});
