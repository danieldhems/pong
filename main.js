var Pong = function(){

	var self = this;

	this.direction = "forward";

	this.controls = {
		player1: {
			"up": 81, // "Q"
			"down": 65 // "A"
		},
		player2: {
			"up": 38, // "Up arrow"
			"down": 40 // "Down arrow"
		}
	};

	this.playerPoint; // Player to be awarded next point on miss (use in conjunction with ball direction)

	this.player1Paddle;
	this.player2Paddle;

	this.keyDown = false;

	this.bindControls = function(){

		window.addEventListener("keyup", function(e){
			if(
				e.keyCode === self.controls.player1.up
				|| e.keyCode === self.controls.player1.down
				|| e.keyCode === self.controls.player2.up
				|| e.keyCode === self.controls.player2.down
			) self.keyDown = false;
		});

		window.addEventListener("keydown", function(e){

			switch(e.keyCode){
				case self.controls.player1.up:
				self.player1Paddle.style.top = parseInt(self.player1Paddle.style.top) - 36 + "px";
				break;

				case self.controls.player1.down:
				self.player1Paddle.style.top = parseInt(self.player1Paddle.style.top) + 36 + "px";
				break;

				case self.controls.player2.up:
				self.player2Paddle.style.top = parseInt(self.player2Paddle.style.top) - 36 + "px";
				break;
				
				case self.controls.player2.down:
				self.player2Paddle.style.top = parseInt(self.player2Paddle.style.top) + 36 + "px";
				break;	
			}
		});

	}	

	this.makeBall = function (width, height){
		this.ball = document.createElement("div");
		this.ball.style.width = width + "px";
		this.ball.style.height = height + "px";
		this.ball.style.position = "absolute";
		this.ball.style.backgroundColor = "grey";
		this.ball.style.borderRadius = "50px";
		this.ball.style.top = "200px";
		this.ball.style.left = 0;

		document.body.appendChild(this.ball);
	}

	this.makePaddles = function (width, size){
		this.player1Paddle = document.createElement("div"),
		this.player2Paddle = document.createElement("div");

		this.player1Paddle.style.width = width + "px";
		this.player1Paddle.style.height = size + "px";
		this.player1Paddle.style.position = "absolute";
		this.player1Paddle.style.backgroundColor = "grey";
		this.player1Paddle.style.top = "200px";
		this.player1Paddle.style.left = "20px";
		document.body.appendChild(this.player1Paddle);

		this.player2Paddle.style.width = width + "px";
		this.player2Paddle.style.height = size + "px";
		this.player2Paddle.style.position = "absolute";
		this.player2Paddle.style.backgroundColor = "grey";
		this.player2Paddle.style.top = "200px";
		this.player2Paddle.style.right = "20px";
		document.body.appendChild(this.player2Paddle);

	}

	this.startBall = function (direction, speed){
		var journey = setInterval( function(){

			var currentX = !self.ball.style.left ? 0 : parseInt(self.ball.style.left);

			/**
			*	Ball movement logic
			*/

			/*
			if( self.getBoundingBox(window).x < currentX + parseInt(self.ball.style.width)){
				self.direction = "backward";
			} else if(0 == currentX){
				self.direction = "forward";
			}
			*/

			if(self.direction == "forward"){
				self.ball.style.left = currentX + 3 + "px";
			} else if(self.direction == "backward") {
				self.ball.style.left = currentX - 3 + "px";
			}

			if(self.direction == "forward"){
				if(self.paddleCollision(self.player2Paddle)) self.direction = "backward";
			} else if (self.direction == "backward"){
				if(self.paddleCollision(self.player1Paddle)) self.direction = "forward";
			}

			self.direction == "forward" ? self.paddleCollision( self.player2Paddle ) : self.paddleCollision( self.player1Paddle);

		}, speed);
	}.bind(this);

	this.paddleCollision = function(paddle){
		var paddleTop = paddle.offsetTop,
			paddleBottom = paddleTop + parseInt(paddle.style.height),
			paddleFace = ( function(){
				return paddle === self.player1Paddle ? self.player1Paddle.offsetLeft + parseInt(self.player1Paddle.style.width) : self.player2Paddle.offsetLeft;
			}());

		if(paddle ===  self.player1Paddle){
			if(
				parseInt(self.ball.style.left) <= paddleFace
				&&
				self.ball.offsetTop >= paddleTop
				&&
				self.ball.offsetTop <= paddleBottom
			){
				return true;
			}
		}
		if(paddle === self.player2Paddle){
			if(
				parseInt(self.ball.style.left) + parseInt(self.ball.style.width) >= paddleFace
				&&
				self.ball.offsetTop >= paddleTop
				&&
				self.ball.offsetTop <= paddleBottom
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
		this.makePaddles(5, 50);
		this.startBall(1);
		this.bindControls();
		this.paddleCollision(self.player1Paddle)
	}

	this.init();

}

window.onload = function(){

	var pong = new Pong();

}