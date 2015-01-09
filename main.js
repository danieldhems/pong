var Pong = function(){

	var self = this;

	this.controls = {
		start: 32, // spacebar,
		help: 104,
		player1: {
			"up": 81, // "Q"
			"down": 65 // "A"
		},
		player2: {
			"up": 38, // "Up arrow"
			"down": 40 // "Down arrow"
		}
	};

	this.sounds = {
		player1Paddle: new Audio("./boop.mp3"),
		player2Paddle: new Audio("./beep.mp3"),
		miss: new Audio("./miss.mp3")
	}

	this.points = {
		player1: 0,
		player2: 0
	};

	this.player1Paddle;
	this.player2Paddle;

	this.config = {
		paddleHeight: undefined,
		scoreToWin: 5,
		ballSpeed: 2, // default
		infoDisplay: {	
			player1: document.querySelector("#player1-info"),
			player2: document.querySelector("#player2-info")
		},
		pointsDisplay: {
			player1: document.querySelector("#player1-points"),
			player2: document.querySelector("#player2-points")		
		},
		helpMessage: document.querySelector("#help"),
		startPlayMessage: "Press space to play<br><br>Press H for help",
		winMessage: "Win"
	};

	this.keyDown = false;

	this.keysDown = [];

	this.gameWon = false;

	this.directionX = "right";
	this.directionY = undefined; // which direction the ball is moving on the Y axis - "up" or "down"
	this.ballYVector = 3; // how many pixels the ball should move up or down on each tick for diagonal movement

	// counter for rally length
	this.numPaddleCollisions = 0;

	this.bindControls = function(){

		window.addEventListener("keyup", function(e){
			self.removeKeyDown(e.keyCode);
		});

		window.addEventListener("keydown", function(e){
			self.keyDown = true;
			self.keyCode = e.keyCode;

			if(e.keyCode == self.controls.start){
				if(self.gameWon) {
					// if the game has been won, reset game state
					self.resetGame();
				} else {
					// run game if it isn't already
					if(!self.gameRunning) {
						self.tick();
					}
				}
			}

			self.addKeyDown(e.keyCode);
				
		});

		window.addEventListener("keypress", function(e){
			if(e.keyCode == self.controls.help){
				self.toggleHelp();
			}
		})
	}	

	// helper method adds unique keys to array on keydown
	this.addKeyDown = function(key){
		for (var i in self.keysDown) {
			if(key === self.keysDown[i]) return false;
		}
		self.keysDown.push(key);
	}
	this.removeKeyDown = function(key){
		for (var i in self.keysDown) {
			if(key === self.keysDown[i]){
				delete self.keysDown[i];
			}
		}
	}

	this.makeBall = function (width, height){
		this.ball = document.createElement("div");
		this.ball.style.width = width + "px";
		this.ball.style.height = height + "px";
		this.ball.style.position = "absolute";
		this.ball.style.backgroundColor = "#fff";
		this.ball.style.top = self.getBoundingBox(window).y / 2 + "px",
		this.ball.style.left = (self.getBoundingBox(window).x / 2) - (width / 2) + "px";
		this.ball.style.display = "none";

		document.body.appendChild(this.ball);
	}

	this.makePaddles = function (width, size){
		// set global paddleheight for use in collision detection
		self.config.paddleHeight = size;

		this.player1Paddle = document.createElement("div"),
		this.player2Paddle = document.createElement("div");

		this.player1Paddle.style.width = width + "px";
		this.player1Paddle.style.height = size + "px";
		this.player1Paddle.style.position = "absolute";
		this.player1Paddle.style.backgroundColor = "#fff";
		this.player1Paddle.style.top = self.getBoundingBox(window).y / 2 - size / 2 + "px";
		this.player1Paddle.style.left = "20px";
		document.body.appendChild(this.player1Paddle);

		this.player2Paddle.style.width = width + "px";
		this.player2Paddle.style.height = size + "px";
		this.player2Paddle.style.position = "absolute";
		this.player2Paddle.style.backgroundColor = "#fff";
		this.player2Paddle.style.top = self.getBoundingBox(window).y / 2 - size / 2 + "px";
		this.player2Paddle.style.right = "20px";
		document.body.appendChild(this.player2Paddle);

	}

	this.showMessage = function(msg, player){
		self.config.infoDisplay[player].innerHTML = msg;
	}

	this.clearMessages = function(){
		self.config.infoDisplay.player1.innerHTML = "";
		self.config.infoDisplay.player2.innerHTML = "";
	}

	this.toggleHelp = function(){
		var helpDisplay = self.config.helpMessage;
		if(helpDisplay.className.indexOf("reveal") > -1){
			helpDisplay.className = self.config.helpMessage.className.replace(" reveal","");
		} else {
		 	helpDisplay.className = helpDisplay.className + " reveal";
		}
	}

	this.addPoint = function(player){
		self.points[player] += 1;
		self.config.pointsDisplay[player].innerHTML = self.points[player];

		if(self.points[player] == self.config.scoreToWin ) self.finishGame(player);

		self.showMessage(self.config.startPlayMessage, player == "player1" ? "player2" : "player1");
	}

	this.finishGame = function(player){
		self.gameWon = true;
		self.showMessage(self.config.winMessage, player);
	}

	this.resetGame = function(){
		self.points.player1 = 0;
		self.points.player2 = 0;
		self.directionX = "right";
		self.directionY = undefined;
		self.gameWon = false;

		self.config.pointsDisplay["player1"].innerHTML = "0";
		self.config.pointsDisplay["player2"].innerHTML = "0";
		self.config.infoDisplay["player1"].innerHTML = "";
		self.config.infoDisplay["player2"].innerHTML = "";

		self.tick();
		self.socket.emit("go");
	}

	this.setDifficulty = function(difficulty){
		switch(difficulty){
			case "easy":
			self.config.ballSpeed = 2;
			break;
			
			case "normal":
			self.config.ballSpeed = 4;
			break;
			
			case "hard":
			self.config.ballSpeed = 6;
			break;

			case "elite":
			self.config.ballSpeed = 8;
			break;
		}
	}

	this.tick = function (speed){
		var tick = setInterval( function(){

			self.gameRunning = true;
			self.ball.style.display = "block";
			self.clearMessages();

			if(self.keyDown){

				for(var key in self.keysDown){

					switch(self.keysDown[key]){

						case self.controls.player1.up:

							var paddle = self.player1Paddle;

							var paddleTop = paddle.offsetTop,
								paddleBottom =  paddleTop + self.config.paddleHeight;

							if( paddleTop - 3 >= 0){
								self.player1Paddle.style.top = paddleTop - 3 + "px";
							}

						break;

						case self.controls.player1.down:
							var paddle = self.player1Paddle,
								paddleTop = paddle.offsetTop,
								paddleBottom = paddle.offsetTop + self.config.paddleHeight;

							if( paddleBottom + 3 <= self.getBoundingBox(window).y){
								self.player1Paddle.style.top = paddleTop + 3 + "px";
							}
						break;

						case self.controls.player2.up:
							var paddle = self.player2Paddle,
								paddleTop = paddle.offsetTop,
								paddleBottom = paddle.offsetTop + self.config.paddleHeight;

							if( paddleTop - 3 >= 0){
								self.player2Paddle.style.top = paddleTop - 3 + "px";
							}
						break;
						
						case self.controls.player2.down:
							var paddle = self.player2Paddle,
								paddleTop = paddle.offsetTop,
								paddleBottom = paddle.offsetTop + self.config.paddleHeight;

							if( paddleBottom + 3 <= self.getBoundingBox(window).y){
								self.player2Paddle.style.top = paddleTop + 3 + "px";
							}
						break;	
					}
				}
			}

			var currentX = !self.ball.style.left ? 0 : parseInt(self.ball.style.left),
				currentY = !self.ball.style.top ? 0 : parseInt(self.ball.style.top),

				ball = self.ball,
				ballTop = ball.offsetTop,
				ballBottom = ball.offsetTop + parseInt(ball.style.height),

				windowTop = 0,
				windowLeft = 0,
				windowBottom = self.getBoundingBox(window).y,
				windowRight = self.getBoundingBox(window).x;

			/**
			*	Ball movement logic
			*/

			// horizontal movement
			if(self.directionX == "right"){
				self.ball.style.left = currentX + self.config.ballSpeed + "px";
			} else if(self.directionX == "left") {
				self.ball.style.left = currentX - self.config.ballSpeed + "px";
			}

			// vertical movement
			if(self.directionY == "up"){
				self.ball.style.top = currentY - self.ballYVector + "px";
			} else if(self.directionY == "down") {
				self.ball.style.top = currentY + self.ballYVector + "px";
			}

			// paddle collision
			if(self.isPaddleCollision(self.player2Paddle)) {
				var trajectoryData = self.returnTrajectory(self.player2Paddle),
					vector = trajectoryData.vector,
					directionY = trajectoryData.directionY;

				self.ballYVector = vector;
				self.directionY = directionY;

				self.directionX = "left";

				self.sounds.player2Paddle.play();

				self.numPaddleCollisions ++;

				if(self.numPaddleCollisions === 4) self.setDifficulty("normal");
				if(self.numPaddleCollisions === 8) self.setDifficulty("hard");
				if(self.numPaddleCollisions === 12) self.setDifficulty("elite");
			}

			if(self.isPaddleCollision(self.player1Paddle)){
				var trajectoryData = self.returnTrajectory(self.player1Paddle),
					vector = trajectoryData.vector,
					directionY = trajectoryData.directionY;

				self.ballYVector = vector;
				self.directionY = directionY;

				self.directionX = "right";

				self.sounds.player1Paddle.play();
				self.numPaddleCollisions ++;

				if(self.numPaddleCollisions === 4) self.setDifficulty("normal");
				if(self.numPaddleCollisions === 8) self.setDifficulty("hard");
				if(self.numPaddleCollisions === 12) self.setDifficulty("elite");
			}
		
			// roof and floor collision
			if(ballBottom >= windowBottom) self.directionY = "up";
			if(ballTop <= windowTop) self.directionY = "down";

			// point scoring when ball missed by paddles
			if(currentX > windowRight) {
				self.addPoint("player1");
				self.sounds.miss.play();
				resetTick();
			}
			if(currentX < windowLeft){
				self.addPoint("player2");
				self.sounds.miss.play();
				resetTick();
			}
		},1);

		function resetTick(){
			// stop the tick
			clearInterval(tick);
			self.gameRunning = false;

			// reset ball position
			self.ball.style.left = self.getBoundingBox(window).x / 2 + "px";
			self.ball.style.top = self.getBoundingBox(window).y / 2 + "px";
			self.ball.style.display = "none";

			// reset paddle positions
			self.player1Paddle.style.top = self.getBoundingBox(window).y / 2 - parseInt(self.player1Paddle.style.height) / 2 + "px";
			self.player2Paddle.style.top = self.getBoundingBox(window).y / 2 - parseInt(self.player1Paddle.style.height) / 2 + "px";

			// reset Y direction so that ball moves horizontally until deflected by a paddle (necessary?)
			self.directionY = undefined;

			self.setDifficulty("easy");
			self.numPaddleCollisions = 0;
		}
	};


	// need to detect which Y position ball collides to determine at which angle to return ball

	this.returnTrajectory = function(paddle){
		var paddleHeight = parseInt(paddle.style.height),
			paddleTop = paddle.offsetTop,

			windowHeight = self.getBoundingBox(window).y,

			ballTop = self.ball.offsetTop,
			ballHeight = parseInt(self.ball.style.height),
			ballCenter = ballHeight / 2;
			
		var collisionPoint = ballTop - paddleTop;

		var vector = (function(){
			return collisionPoint <= 25 || collisionPoint >= 75 ? 3
				:  collisionPoint > 25 && collisionPoint <= 45 || collisionPoint < 75 && collisionPoint >= 60 ? 2
				:  1;
		})();

		return {
			"vector": vector,
			"directionY": collisionPoint <= 49 ? "up" : collisionPoint >= 51 ? "down" : undefined
		}
	}

	this.isPaddleCollision = function(paddle){
		var paddleTop = paddle.offsetTop,
			paddleBottom = paddleTop + parseInt(paddle.style.height),
			paddleFace = ( function(){
				return paddle === self.player1Paddle ? self.player1Paddle.offsetLeft + parseInt(self.player1Paddle.style.width) : self.player2Paddle.offsetLeft;
			}()),

			ballTop = self.ball.offsetTop,
			ballBottom = self.ball.offsetTop + parseInt(self.ball.style.height);

		if(paddle === self.player1Paddle){
			if(
				parseInt(self.ball.style.left) <= paddleFace
				&&
				ballBottom >= paddleTop
				&&
				ballTop <= paddleBottom
			){
				return true;
			}
		}
		if(paddle === self.player2Paddle){
			if(
				parseInt(self.ball.style.left) + parseInt(self.ball.style.width) >= paddleFace
				&&
				ballBottom >= paddleTop
				&&
				ballTop <= paddleBottom
			){
				return true;
			}
		}

	}

	this.getBoundingBox = function (element){
		return {
			x: element.innerWidth,
			y: element.innerHeight
		}
	}

	this.init = function (){
		this.makeBall(20, 20);
		this.makePaddles(5,100);
		this.bindControls();

		self.config.infoDisplay["player1"].innerHTML = self.config.startPlayMessage;
	}

	this.init();

}

window.onload = function(){

	var pong = new Pong();

	var goButton = document.querySelector("#js-start");
}
