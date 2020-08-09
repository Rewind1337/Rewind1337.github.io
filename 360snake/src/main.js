const FRAMES_PER_SECOND = 60;
const BASE_SEGMENT_SIZE = 25;
const BASE_FOOD_SIZE = 20;
const NUMBER_OF_PLAYERS = 1;
const DRAW_SHADOW_BLUR = false;
const DO_COLOR_SHIFT = true;

let $snakes;
let $food;
let $c;
let left = false;
let right = false;
let accell = false;
let accelldraw = 0;
let timer = null;
let gameScore = 0;

let randomcolor = 0;

class Snake {
	constructor () {
		this.head = {x: width/2, y: height/2}
		this.body = [];
		this.angle = Math.random() * 360;
		this.speed = 1;
		this.size = 1;
		this.alive = true;
		this.score = 0;
		this.color = 0;
	}

	draw() {
		for (let i = this.body.length - 1; i > 0; i--) {
			push();
			translate(this.body[i].x, this.body[i].y);
			noStroke();
			fill((this.color + i)%360, 100, 50, 1);
			if (accell && DRAW_SHADOW_BLUR) {
				accelldraw ++;
				drawingContext.shadowBlur = 2;
				drawingContext.shadowColor = 'white';
			} else {
				accelldraw = 0;
			}
			circle(0, 0, max(3, BASE_SEGMENT_SIZE * (this.body[i].size * 0.80) * (1 - i / this.body.length)));
			pop();
		}

		push();
			translate(this.head.x, this.head.y);
			noStroke();
			fill(this.color%360, 100, 50, 1);
			if (accell && DRAW_SHADOW_BLUR) {
				drawingContext.shadowBlur = 5;
				drawingContext.shadowColor = 'white';
			}
			circle(0, 0, BASE_SEGMENT_SIZE * (this.size * 0.80));
		pop();
	}

	move() {
		if (this.alive) {
			for (let i = 0; i < $food.length; i++) {
				let hit = collideCircleCircle($food[i].x, $food[i].y, BASE_FOOD_SIZE, this.head.x, this.head.y, this.size * BASE_SEGMENT_SIZE * 0.8 );
				if (hit) {
					gainScore(i);
					return;
				}
			}

			let alive = true;
			for (let i = 8; i < this.body.length; i+= 5) {
				let hit;
				if (i != 0)
					hit = collideCircleCircle(this.body[i].x, this.body[i].y, BASE_SEGMENT_SIZE * (this.body[i].size * 0.80), this.head.x, this.head.y, this.size * BASE_SEGMENT_SIZE * 0.8 * (1 - i / this.body.length));
				
				if (hit) {
					alive = false;
					this.alive = false;
				}
			}

			if (alive) {
				if (this.head.x <= -(this.size * BASE_SEGMENT_SIZE * 0.8))
					this.head.x = width + (this.size * (BASE_SEGMENT_SIZE / 2) * 0.8);
				if (this.head.y <= -(this.size * BASE_SEGMENT_SIZE * 0.8))
					this.head.y = height + (this.size * (BASE_SEGMENT_SIZE / 2) * 0.8);
				if (this.head.x >= width + (this.size * BASE_SEGMENT_SIZE * 0.8))
					this.head.x = -(this.size * (BASE_SEGMENT_SIZE / 2) * 0.8);
				if (this.head.y >= height + (this.size * BASE_SEGMENT_SIZE * 0.8))
					this.head.y = -(this.size * (BASE_SEGMENT_SIZE / 2) * 0.8);

				if (left) 
					this.angle+=0.08;
				if (right) 
					this.angle-=0.08;

				if (accell) {
					this.head.x += sin(this.angle) * (this.speed * 7);
					this.head.y += cos(this.angle) * (this.speed * 7);
					if (DO_COLOR_SHIFT)
						this.color += this.size * 0.25;
				} else {
					this.head.x += sin(this.angle) * (this.speed * 3);
					this.head.y += cos(this.angle) * (this.speed * 3);
				}
				this.popBody();
			}
		} else {
			this.popBody();
		}
	}

	popBody() {
		this.body.unshift({x: this.head.x, y: this.head.y, size: this.size});

		if (this.body.length > ((gameScore+1)*15)) {
			this.body.pop();
		}
	}
}

function setup() {
    $c = createCanvas(800, 800, P2D);
    $c.parent("#mainContain");
    colorMode(HSL, 360, 100, 100, 1);
    timer = setInterval(tickSnake, 1000 / FRAMES_PER_SECOND);
    setupGame();
    frameRate(30);
}

function draw() {
	background(0, 0, 0, 1);
	for (let i = 0; i < $snakes.length; i++) {
		$snakes[i].draw();
	}
	for (let i = 0; i < $food.length; i++) {
		circle($food[i].x, $food[i].y, BASE_FOOD_SIZE);
	}
}

function tickSnake() {
	for (let i = 0; i < $snakes.length; i++) {
		$snakes[i].move();
	}
}

function gainScore(foodindex) {
	$food.splice(foodindex, 1);
	for (let i = 0; i < $snakes.length; i++) {
		$snakes[i].speed += 0.03;
		$snakes[i].size += 0.015;
	}
	gameScore ++;
	$("#score").text(gameScore);
	if ($food.length == 0)
		spawnFood();
}

function spawnFood() {	
	$food.push({x: Math.random() * width, y: Math.random() * height});

	let r = Math.random();
	if (r > 0.5 && $food.length <= 1) {
		$food.push({x: Math.random() * width, y: Math.random() * height});
		r = Math.random();
		if (r > 0.5) {
			$food.push({x: Math.random() * width, y: Math.random() * height});
			r = Math.random();
			if (r > 0.5)
				$food.push({x: Math.random() * width, y: Math.random() * height});
		}
	}
}

function setupGame() {
	$snakes = [];
	$food = [];
	for (let i = 0; i < NUMBER_OF_PLAYERS; i++) {
		$snakes[i] = new Snake();
		$snakes[i].color = Math.random() * 360;
	}
	spawnFood();
}

function keyPressed() {
	if (key == "a" || key == "A" || keyCode === LEFT_ARROW) {left = true;right = false;}
	if (key == "d" || key == "D" || keyCode === RIGHT_ARROW) {right = true;left = false;}
	if (key == "w" || key == "W" || keyCode === UP_ARROW) {accell = true;}
}

function keyReleased() {
	if (key == "a" || key == "A" || keyCode === LEFT_ARROW) {left = false;}
	if (key == "d" || key == "D" || keyCode === RIGHT_ARROW) {right = false;}
	if (key == "w" || key == "W" || keyCode === UP_ARROW) {accell = false;}
}