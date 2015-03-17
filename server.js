var http = require("http"),
	express = require("express"),
	io = require("socket.io"),
	crypto = require('crypto');

var app = express();

app.use(express.static(__dirname));

var server = http.Server(app);

app.get("/", function(req, res){
	res.sendfile("index.html");
});

var io = io(server);

var clients = [];
var games = [];

io.on("connect", function(socket){
	console.log(socket.id + " connected");

	clients.push(socket);

	// when clients obj has 3 keys, first one being the server itself, send ready message
	if(clients.length == 2) {

		var game = {
			id: crypto.randomBytes(20).toString('hex'),
			player1: clients[0].id,
			player2: clients[1].id
		};


		io.to(game.player1).emit("gameReady", {
			gameId: game.id,
			playerId: game.player1,
			isHost: true
		});

		io.to(game.player2).emit("gameReady", {
			gameId: game.id,
			playerId: game.player2,
			isHost: false
		});

		games.push(game);

		console.log(games);
		
		clients = [];

	}

	io.on('gameStart', function(data){
		console.log('gameStart '+data);
		io.broadcast.to(data.gameId).emit('gameStart', {});
	});
});

server.listen(3000)
