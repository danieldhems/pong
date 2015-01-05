var http = require("http"),
	express = require("express"),
	io = require("socket.io");

var app = express();

app.use(express.static(__dirname));

var server = http.Server(app);

app.get("/", function(req, res){
	res.sendfile("index.html");
});

var io = io(server);

var clients = [];

io.on("connect", function(socket){
	console.log(socket.id + " connected");

	var client = socket;

	clients.push(socket);
console.log(clients[0]);
console.log(clients[1]);
	// when clients obj has 3 keys, first one being the server itself, send ready message
	if(clients.length == 2) {

		var game = {
			player1: clients[0],
			player2: clients[1]
		}

		io.to(game.player1.id).emit("ready", { isHost: true } );
		io.to(game.player2.id).emit("ready", { isHost: false } );

	} else {

		client.emit("waiting", {
			id: clients[socket.id].id,
			message: "waiting for other player" 
		})

	}
});

io.on("ready", function(data){
	
});

server.listen(3000)
