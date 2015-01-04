var Pong = function(){

	var self = this;

	this.directionX = "right";
	this.directionY = undefined;

	this.controls = {
		start: 32, // spacebar
		player1: {
			"up": 81, // "Q"
			"down": 65 // "A"
		},
		player2: {
			"up": 38, // "Up arrow"
			"down": 40 // "Down arrow"
		}
	};

	this.points = {
		player1: 0,
		player2: 0
	};

	this.player1PointsDisplay = document.querySelector("#player1");
	this.player2PointsDisplay = document.querySelector("#player2");

	this.player1Paddle;
	this.player2Paddle;

	this.config = {
		paddleHeight: 50
	};

	this.keyDown = false;

	this.getUnitlessNum = function(value){
		return parseInt(value.replace(/[a-zA-Z]/g, ''));
	}

	this.gameWon = false;

	this.ballYVector = 3;

	this.player1KeyIsDown = false,
	this.player1KeyIsUp = true;

	this.bindControls = function(){

		window.addEventListener("keyup", function(e){
			self.keyDown = false;
		});

		window.addEventListener("keydown", function(e){
			self.keyDown = true;
			self.keyCode = e.keyCode;

			if(e.keyCode == self.controls.start){
				if(self.gameWon) {
					// if the game has been won, reset game state
					self.resetGame();
					self.tick();
				} else {
					// run game if it isn't already
					if(!self.gameRunning) self.tick();
				}
			}
		});
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

	this.addPoint = function(player){
		self.points[player] += 1;
		if(player === "player1"){
			self.player1PointsDisplay.innerHTML = self.points[player];
		} else if(player === "player2") {
			self.player2PointsDisplay.innerHTML = self.points[player];
		}

		if(self.points[player] == 1 ) self.finishGame(player);
	}

	this.finishGame = function(player){
		self.gameWon = true;

		var winBanner = document.querySelector("#win-"+player);
		winBanner.className += " reveal";
	}

	this.resetGame = function(){
		self.points.player1 = 0;
		self.points.player2 = 0;
		self.directionX = "right";
		self.directionY = undefined;
		self.gameWon = false;

		var winDisplays = document.querySelectorAll(".win-display");
		for(var i=0, l=winDisplays.length; i<l; i++){
			winDisplays[i].className = winDisplays[i].className.replace("reveal","");
		}
	}

	this.tick = function (speed){
		var tick = setInterval( function(){

			self.gameRunning = true;

			self.ball.style.display = "block";

			if(self.keyDown){

				switch(self.keyCode){

					case self.controls.player1.up:

						var paddle = self.player1Paddle;

						var paddleTop = paddle.offsetTop,
							paddleBottom =  paddleTop + self.config.paddleHeight;

						if( paddleTop - 1 > 0){
							self.player1Paddle.style.top = paddleTop - 3 + "px";
						}

					break;

					case self.controls.player1.down:
						var paddle = self.player1Paddle,
							paddleTop = paddle.offsetTop,
							paddleBottom = paddle.offsetTop + self.config.paddleHeight;

						if( paddleBottom + 1 < self.getBoundingBox(window).y){
							self.player1Paddle.style.top = paddleTop + 3 + "px";
						}
					break;

					case self.controls.player2.up:
						var paddle = self.player2Paddle,
							paddleTop = paddle.offsetTop,
							paddleBottom = paddle.offsetTop + self.config.paddleHeight;

						if( paddleBottom + 1 < self.getBoundingBox(window).y){
							self.player2Paddle.style.top = paddleTop - 3 + "px";
						}
					break;
					
					case self.controls.player2.down:
						var paddle = self.player2Paddle,
							paddleTop = paddle.offsetTop,
							paddleBottom = paddle.offsetTop + self.config.paddleHeight;

						if( paddleBottom + 1 < self.getBoundingBox(window).y){
							self.player2Paddle.style.top = paddleTop + 3 + "px";
						}
					break;	
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
				self.ball.style.left = currentX + 3 + "px";
				//self.ball.style.top = currentY - (25/90) + "px";
			} else if(self.directionX == "left") {
				self.ball.style.left = currentX - 3 + "px";
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
			}

			if(self.isPaddleCollision(self.player1Paddle)){
				var trajectoryData = self.returnTrajectory(self.player1Paddle),
					vector = trajectoryData.vector,
					directionY = trajectoryData.directionY;

				self.ballYVector = vector;
				self.directionY = directionY;

				self.directionX = "right";
			}
		
			// roof and floor collision
			if(ballBottom >= windowBottom) self.directionY = "up";
			if(ballTop <= windowTop) self.directionY = "down";

			// point scoring when ball missed by paddles
			if(currentX > windowRight) {
				self.addPoint("player1");
				resetTick();
			}
			if(currentX < windowLeft){
				self.addPoint("player2");
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
	}

	this.init();

}

window.onload = function(){

	var pong = new Pong();

	var goButton = document.querySelector("#js-start");

}