var http = require("http"),
	express = require("express");

var app = express();
var server = http.Server(app);

app.use(express.static(__dirname));

app.get("/", function(req, res){
	res.sendfile("index.html");
});

server.listen(3000)
