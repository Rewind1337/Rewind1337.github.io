const DRAW_SHADOWS = false;

let canvas;
let global_x = 0;
let global_y = 0;

let pendingTower = undefined;
let placingTower = false;
let canPlaceTower = false;

let sfx = [];

let pendingSpell = undefined;
let castingSpell = false;
let selectedTower = undefined;

let game;

let test_map = {
	pathdata: [
		{pos: {x: 0.125, y: 0.125}, type: "waypoint",},
		{pos: {x: 0.875, y: 0.125}, type: "waypoint",},
		{pos: {x: 0.875, y: 0.5}, type: "waypoint",},
		{pos: {x: 0.125, y: 0.5}, type: "waypoint",},
		{pos: {x: 0.125, y: 0.875}, type: "waypoint",},
		{pos: {x: 0.333, y: 0.875}, type: "waypoint",},
		{pos: {x: 0.333, y: 0.333}, type: "waypoint",},
		{pos: {x: 0.666, y: 0.333}, type: "waypoint",},
		{pos: {x: 0.666, y: 0.875}, type: "waypoint",},
		{pos: {x: 0.875, y: 0.875}, type: "waypoint",},
	],
	obstacledata: [
		{pos: {x: 0.125, y: 0.10}, size: {x: 0.75, y: 0.05}},
		{pos: {x: 0.85, y: 0.125}, size: {x: 0.05, y: 0.375}},
		{pos: {x: 0.125, y: 0.475}, size: {x: 0.75, y: 0.05}},
		{pos: {x: 0.1, y: 0.5}, size: {x: 0.05, y: 0.375}},
		{pos: {x: 0.125, y: 0.85}, size: {x: 0.208, y: 0.05}},
		{pos: {x: 0.308, y: 0.333}, size: {x: 0.05, y: 0.543}},
		{pos: {x: 0.333, y: 0.308}, size: {x: 0.333, y: 0.05}},
		{pos: {x: 0.641, y: 0.333}, size: {x: 0.05, y: 0.543}},
		{pos: {x: 0.666, y: 0.85}, size: {x: 0.208, y: 0.05}},
	],
	towerdata: [],
	enemydata: []
}

class Tower {
	constructor (element, size, range, atkspeed) {
		this.level = 1;
		this.element = element;
		this.pos = {x: -1, y: -1};
		this.size = size;
		this.range = range;
		this.targetEnemy = undefined;

		this.targetMode = "first";
		this.targetDotFilter = "none";
		
		this.cooldown = 0;
		this.atkspeed = atkspeed;

	}
	
	setPos(x, y) {
		this.pos = {x: x, y: y};
	}

	findNewEnemy() {
		this.targetEnemy = undefined;
		
		switch (this.targetMode) {
			case "first":
				this.firstEnemy();
			break;
			case "last":
				this.lastEnemy();
			break;
			case "closest":
				this.closestEnemy();
			break;
		}
	}

	tick() {
	/*	if (this.targetEnemy) {
			let _d = dist(this.targetEnemy.pos.x, this.targetEnemy.pos.y, this.pos.x, this.pos.y);
			if (_d >= this.range)
				this.findNewEnemy();
		} else {
			this.findNewEnemy();
		}
	*/

		if (this.cooldown < this.atkspeed) {
			this.cooldown++
		} else {
			if (this.fire()) {
				this.cooldown = 0;
			}
		}
	}

	closestEnemy() {
		let distance = 1e69;
		let id = -1;
		for (let i = 0; i < game.mapObject.enemydata.length; i++) {
			let _d = dist(game.mapObject.enemydata[i].pos.x, game.mapObject.enemydata[i].pos.y, this.pos.x, this.pos.y);
			if (_d <= distance) {
				
				if (this.targetDotFilter != "none") {
					let enemy = game.mapObject.enemydata[i];
					let skip = false;
					
					for (let j = 0; j < enemy.dots.length; j++) {
						if (enemy.dots[j].name == this.targetDotFilter) {skip = true; break;}
					}
					
					if (skip == true) {continue;}
				}
				
				distance = _d;
				id = i;
			}
		}
		if (id != -1) {
			this.targetEnemy = game.mapObject.enemydata[id];
		}
	}

	lastEnemy() {
		let id = -1;
		for (let i = 0; i < game.mapObject.enemydata.length; i++) {
			let _d = dist(game.mapObject.enemydata[i].pos.x, game.mapObject.enemydata[i].pos.y, this.pos.x, this.pos.y);
			if (_d <= this.range) {
				
				if (this.targetDotFilter != "none") {
					let enemy = game.mapObject.enemydata[i];
					let skip = false;
					
					for (let j = 0; j < enemy.dots.length; j++) {
						if (enemy.dots[j].name == this.targetDotFilter) {skip = true; break;}
					}
					
					if (skip == true) {continue;}
				}
				
				id = i;
			}
		}
		if (id != -1) {
			this.targetEnemy = game.mapObject.enemydata[id];
		}
	}

	firstEnemy() {
		let id = -1;
		for (let i = 0; i < game.mapObject.enemydata.length; i++) {
			let _d = dist(game.mapObject.enemydata[i].pos.x, game.mapObject.enemydata[i].pos.y, this.pos.x, this.pos.y);
			if (_d <= this.range) {
				
				if (this.targetDotFilter != "none") {
					let enemy = game.mapObject.enemydata[i];
					let skip = false;
					
					for (let j = 0; j < enemy.dots.length; j++) {
						if (enemy.dots[j].name == this.targetDotFilter) {skip = true; break;}
					}
					
					if (skip == true) {continue;}
				}
				
				id = i;
				break;
			}
		}
		if (id != -1) {
			this.targetEnemy = game.mapObject.enemydata[id];
		}
	}
	
	dealDamage(_sfx, damage) {
		damage = 0.5 + this.level * 2;
		this.targetEnemy.hit(damage, this.element);

		_sfx.x1 = this.pos.x;
		_sfx.y1 = this.pos.y;
		_sfx.x2 = this.targetEnemy.pos.x;
		_sfx.y2 = this.targetEnemy.pos.y;
		_sfx.ttl = 15;
	}
	
	fire() {
		this.findNewEnemy();
		
		if (this.targetEnemy != undefined) {
			let _d = dist(this.targetEnemy.pos.x, this.targetEnemy.pos.y, this.pos.x, this.pos.y);
			if (_d <= this.range) {
				let _sfx = {src: this.type, element: this.element};
				let damage;
				
				this.dealDamage(_sfx, damage);
				
				sfx.push(_sfx);
				
				if (this.targetEnemy.hp <= 0) {
					this.targetEnemy = undefined;
					this.findNewEnemy();
				}
				
				return true;
			}
		}
		return false;
	}

	draw() {
		stroke(0);
		fill(0, 0, 70);
		strokeWeight(1);
		ellipse(this.pos.x * width, this.pos.y * height, this.size, this.size);
	}
}

class LaserTower extends Tower {
	type = "laser";
	
	dealDamage(_sfx, damage) {
		damage = 0.5 + this.level * 2;
		this.targetEnemy.hit(damage, this.element);

		_sfx.x1 = this.pos.x;
		_sfx.y1 = this.pos.y;
		_sfx.x2 = this.targetEnemy.pos.x;
		_sfx.y2 = this.targetEnemy.pos.y;
		_sfx.ttl = 15;
	}
}

class BombTower extends Tower {
	type = "bomb";
	
	dealDamage(_sfx, damage) {
		let enemieshit = [];
		damage = (0.5 + this.level * 2) * 2;
		for (let i = 0; i < game.mapObject.enemydata.length; i++) {
			let _dd = dist(game.mapObject.enemydata[i].pos.x, game.mapObject.enemydata[i].pos.y, this.targetEnemy.pos.x, this.targetEnemy.pos.y);
			if (_dd <= 0.05) {
				enemieshit.push({index: i, distance: _dd * 19});
			}
		}
		for (let i = 0; i < enemieshit.length; i++) {
			game.mapObject.enemydata[enemieshit[i].index].hit((1 - enemieshit[i].distance) * damage, this.element)
		}

		_sfx.x = this.targetEnemy.pos.x;
		_sfx.y = this.targetEnemy.pos.y;
		_sfx.ttl = 10;
	}
}

class BleedTower extends Tower {
	type = "laser";
	
	targetDotFilter = "bleed";
	
	dealDamage(_sfx, damage) {
		damage = 0.1;
		this.targetEnemy.hit(damage, this.element);
		this.targetEnemy.addUniqueDot({name: 'bleed', time: 100, damage: 0.02})

		_sfx.x1 = this.pos.x;
		_sfx.y1 = this.pos.y;
		_sfx.x2 = this.targetEnemy.pos.x;
		_sfx.y2 = this.targetEnemy.pos.y;
		_sfx.ttl = 5;
	}
}

class Enemy {
	constructor (enemytype, wave) {
		this.pos = {x: -0.04, y: -0.04};
		this.v;
		this.waypoint = 0;
		this.enemytype = enemytype;
		this.speed = 2.5;
		this.angle = 0;

		this.heartbeat = 0;

		this.dots = [];

		this.hp = 3;
		this.maxhp = 3;
	}

	hit(dmg, element) {
		if (this.hp > dmg) {
			this.hp -= dmg;
		} else if (this.hp <= dmg) {
			this.death();
		}
	}
	
	addDot(dot) {
		this.dots.push(dot);
	}
	addUniqueDot(dot) {
		for (let i = 0; i < this.dots.length; i++) {
			if (dot.name == this.dots[i].name) {
				return false;
			}
		}
		this.dots.push(dot);
		return true;
	}

	death() {
		this.hp = 0;
		game.mapObject.enemydata.splice(game.mapObject.enemydata.indexOf(this), 1);
	}

	tick() {
		for (let i = 0; i < this.dots.length; i++) {
			let dot = this.dots[i];
			
			this.hit(dot.damage, dot.element);
			
			dot.time -= 1;
			if (dot.time <= 0) {
				this.dots.splice(i, 1);
				i -= 1;
			}
		}
		
		this.heartbeat ++;
		this.move(1);
	}
	
	move(amount) {
		let distanceRemaining = dist(this.pos.x, this.pos.y, game.mapObject.pathdata[this.waypoint + 1].pos.x, game.mapObject.pathdata[this.waypoint + 1].pos.y);
		
		if (distanceRemaining < this.speed / 1000) {
			if (this.waypoint == game.mapObject.pathdata.length - 2) {
				this.death();
			} else {
				this.waypoint++;
				this.pos.x = game.mapObject.pathdata[this.waypoint].pos.x;
				this.pos.y = game.mapObject.pathdata[this.waypoint].pos.y;
				
				this.move(distanceRemaining * 1000 / this.speed);
				return;
			}
		}
		
		this.v = createVector(game.mapObject.pathdata[this.waypoint + 1].pos.x - this.pos.x, game.mapObject.pathdata[this.waypoint + 1].pos.y - this.pos.y);
		this.v = this.v.div(this.v.mag());
		
		this.pos.x += this.v.x * this.speed * amount / 1000;
		this.pos.y += this.v.y * this.speed * amount / 1000;
	}

	draw() {
		stroke(0);
		fill(0, 0, 70);
		strokeWeight(1);
		toggleShadows(true, "rgb(255, 255, 255", 8);
		ellipse(this.pos.x * width, this.pos.y * height, 16, 16);
		toggleShadows(false);

		stroke(0);
		fill(0, 0, 0);
		strokeWeight(1);
		rect(this.pos.x * width - 16, this.pos.y * height - 24, 32, 4);

		noStroke();
		fill(0, 100, 50);
		rect(this.pos.x * width - 16, this.pos.y * height - 24, 32 * (this.hp / this.maxhp), 4);
	}
}

class Game {
	constructor () {
		this.mapObject = test_map;
		this.mapObject.pathdata.unshift({pos: {x: 0, y: 0}, type: "start"})
		this.mapObject.pathdata.push({pos: {x: 1, y: 1}, type: "end"})

		this.wave = 0;
		this.waveTimer;
		this.waveAmount = 0;
		this.waveCap = 0;
	}

	startWave(enemytype, amount, delay = 1000) {
		this.waveCap = amount;
		this.waveAmount = 0;
		clearInterval(game.waveTimer);
		this.waveTimer = setInterval(function() {
			game.mapObject.enemydata.push(new Enemy(enemytype));
			game.waveAmount++;
			if (game.waveAmount >= game.waveCap)
				clearInterval(game.waveTimer);
		}, delay)
	}

	draw() {
		stroke(0, 0, 100);
		fill(0, 0, 100);
		strokeWeight(32);
		for (let i = 0; i < this.mapObject.pathdata.length - 1; i++) {
			if (i == 0) {stroke(120, 100, 50);}
			if (i > 0 && i < this.mapObject.pathdata.length - 1) {stroke(0, 0, 100);}
			if (i == this.mapObject.pathdata.length - 2) {stroke(0, 100, 50);}
			line(this.mapObject.pathdata[i].pos.x * width, this.mapObject.pathdata[i].pos.y * height, this.mapObject.pathdata[i+1].pos.x * width, this.mapObject.pathdata[i+1].pos.y * height);
		}

		stroke(0, 0, 100);
		fill(0, 0, 100);
		strokeWeight(1);
		toggleShadows(true, "rgb(0, 0, 0", 8);
		for (let i = 1; i <= this.mapObject.pathdata.length - 2; i++) {
			ellipse(this.mapObject.pathdata[i].pos.x * width, this.mapObject.pathdata[i].pos.y * height, 32, 32);
		}
		toggleShadows(false);

		for (let i = 0; i <= this.mapObject.enemydata.length - 1; i++) {
			this.mapObject.enemydata[i].draw();
		}

		for (let i = 0; i <= this.mapObject.towerdata.length - 1; i++) {
			this.mapObject.towerdata[i].draw();
		}

		for (let i = 0; i < sfx.length; i++) {
			stroke(0, 0, 100);
			fill(0, 0, 100);
			toggleShadows(true, "rgb(255, 255, 255", 8);
			switch (sfx[i].src) {
				case "laser":
					strokeWeight(sfx[i].ttl / 2);
					line(sfx[i].x1 * width, sfx[i].y1 * height, sfx[i].x2 * width, sfx[i].y2 * height);
				break;
				case "bomb":
					toggleShadows(true, "rgb(0, 0, 0", 8);
					noStroke();
					fill(0, 0, 0, 0.8);
					circle(sfx[i].x * width, sfx[i].y * height, (15 - sfx[i].ttl)*2);
				break;
			}
			toggleShadows(false);
			sfx[i].ttl --;
			if (sfx[i].ttl <= 0) {sfx.splice(sfx.indexOf(sfx[i]), 1)}
		}

		if (placingTower) {
			stroke(0);
			fill(0, 0, 70);
			strokeWeight(1);
			ellipse(mouseX, mouseY, pendingTower.size, pendingTower.size);
			if (canPlaceTower) {
				fill(0, 0, 50, 0.25);
			} else {
				fill(0, 100, 50, 0.25);
			}
			stroke(0, 0, 100);
			strokeWeight(1);
			ellipse(mouseX, mouseY, pendingTower.range*width, pendingTower.range*height);
		}
	}

	tick() {
		for (let i = 0; i < this.mapObject.enemydata.length; i++) {
			this.mapObject.enemydata[i].tick();
		}

		for (let i = 0; i < this.mapObject.towerdata.length; i++) {
			this.mapObject.towerdata[i].tick();
		}
	}
}

function setup() {
	canvas = createCanvas(750, 750);
	canvas.parent("#canvasCol");
	angleMode(DEGREES);
	ellipseMode(RADIUS);
	colorMode(HSL, 360, 100, 100);
	smooth();
	frameRate(60);
	setInterval(gameTick, 1000/30);

	$("#canvasCol").css("height", height + 4)

	$(".menuTabSwitch").click(function() {
		$(".menuRow").hide();
		$($(this).attr("data-target")).fadeIn(200);
		$(".menuTabSwitch").removeClass("active")
		$(this).addClass("active");
	})

	$("body").mousemove(function(e) {
	    global_x = e.pageX;
	    global_y = e.pageY;
	})

	$(".modalClose").click(function() {
		$($(this).attr("data-target")).hide();
	})

	$(".tooltipped").hover(function() {
		$("#tooltip").mousemove();
		$("#tooltip-text").html($(this).attr("data-tooltiptext"));
		$("#tooltip").css("display", "block");
	}, function() {
		$("#tooltip").css("display", "none");
	})

	$(".tooltipped").on("mousemove", function() {
		let left = 0;
		let top = 0;
		if (global_x <= $("#tooltip").width() / 2) {
			left = 0 + "px";
			top = global_y + 20 + "px";
		} else if (global_x >= (screen.width-10 - $("#tooltip").width() / 2)) {
			left = (screen.width - 10) - $("#tooltip").width() + "px";
			top = global_y + 20 + "px";
		} else {
			left = (global_x - 2) - Math.floor($("#tooltip").width()/2) + "px";
			top = global_y + 20 + "px";
		}
		$("#tooltip").css("top", top).css("left", left)
	})

	$(".btn-tower").click(function() {
		let id = parseInt($(this).attr("data-id"));
		towerClicked(id);
	})

	$(".btn-spell").click(function() {
		let id = parseInt($(this).attr("data-id"));
		spellClicked(id);
	})

	$("#towerMenuRow").fadeIn(200);
	$("#resource-currency").fadeIn(200).css("display", "inline-block");
	$("#resource-lifes").fadeIn(200).css("display", "inline-block");
	$("#resource-energy").fadeIn(200).css("display", "inline-block");
	$(".wave-box").fadeIn(200).css("display", "block");

	let spans = $("span.gen-colors");
	for (let i = 0; i < spans.length; i++) {
		console.log(spans[i]);
		let t = $(spans[i]).text();
		if (t == "Physical") $(spans[i]).html('<span style="color: white;">' + t + '</span>');
		if (t == "Fire") $(spans[i]).html('<span style="color: red;">' + t + '</span>');
		if (t == "Ice") $(spans[i]).html('<span style="color: teal;">' + t + '</span>');
		if (t == "Poison") $(spans[i]).html('<span style="color: lightgreen;">' + t + '</span>');
	}
	game = new Game();
}

function gameTick() {
	game.tick();
}

function draw() {
	background(20);
	game.draw();
}

function selectTower(id) {
	let left, top;
	if (global_x <= $("#towerModal").width() / 2) {
		left = 0 + "px";
		top = global_y + 20 + "px";
	} else if (global_x >= (screen.width-10 - $("#towerModal").width() / 2)) {
		left = (screen.width - 10) - $("#towerModal").width() + "px";
		top = global_y + 20 + "px";
	} else {
		left = (global_x - 2) - Math.floor($("#towerModal").width()/2) + "px";
		top = global_y + 20 + "px";
	}
	$("#towerModal").css("top", top).css("left", left).css("display", "block");
}

function towerClicked(id) {
	switch (id) {
		case 0:
			pendingTower = new LaserTower("physical", 16, 0.12, 24);
		break;
		case 1:
			pendingTower = new BombTower("physical", 16, 0.10, 40);
		break;
		case 2:
			pendingTower = new BleedTower("physical", 16, 0.14, 32);
		break;
	}
	placingTower = true;
}

function spellClicked(id) {

}

function toggleShadows(bool, color, size) {
	if (DRAW_SHADOWS) {
		if (bool) {
			drawingContext.shadowColor = color;
			drawingContext.shadowBlur = size;
		} else {
			drawingContext.shadowBlur = 0;
		}
	} else {
		return false;
	}
}
function mouseMoved() {
	if (mouseX >= 0 && mouseX <= width) {
		if (mouseY >= 0 && mouseY <= height) {
			if (placingTower) {
				canPlaceTower = true;
				for (let i = 0; i < game.mapObject.pathdata.length; i++) {
					hit = collideCircleCircle(mouseX,mouseY,pendingTower.size + 8,game.mapObject.pathdata[i].pos.x*width,game.mapObject.pathdata[i].pos.y*height,64)
					if (hit) {
						canPlaceTower = false;
						return;
					}
				}
				for (let i = 0; i < game.mapObject.towerdata.length; i++) {
					hit = collideCircleCircle(mouseX,mouseY,pendingTower.size + 8,game.mapObject.towerdata[i].pos.x*width,game.mapObject.towerdata[i].pos.y*height,game.mapObject.towerdata[i].size*2)
					if (hit) {
						canPlaceTower = false;
						return;
					}
				}
				for (let i = 0; i < game.mapObject.obstacledata.length; i++) {
					hit = collideRectCircle(game.mapObject.obstacledata[i].pos.x*width, game.mapObject.obstacledata[i].pos.y*height, game.mapObject.obstacledata[i].size.x*width, game.mapObject.obstacledata[i].size.y*height, mouseX,mouseY,pendingTower.size + 8)
					if (hit) {
						canPlaceTower = false;
						return;
					}
				}
				hit = collideCircleCircle(mouseX,mouseY,pendingTower.size + 8, 0, 0, 200)
				if (hit) {
					canPlaceTower = false;
					return;
				}
				hit = collideCircleCircle(mouseX,mouseY,pendingTower.size + 8, 1*width, 1*height, 200)
				if (hit) {
					canPlaceTower = false;
					return;
				}
			}
		}
	}
}

function mousePressed(event) {
	mouseMoved();
	if (mouseX >= 0 && mouseX <= width) {
		if (mouseY >= 0 && mouseY <= height) {
			if (placingTower) {
				if (canPlaceTower) {
					let fX = mouseX / width;
					let fY = mouseY / height;
					game.mapObject.towerdata.push(pendingTower);
					pendingTower.setPos(fX, fY);
					placingTower = false;
				}
			} else {
				for (let i = 0; i < game.mapObject.towerdata.length; i++) {
					let hit = collidePointCircle(mouseX,mouseY,game.mapObject.towerdata[i].pos.x*width,game.mapObject.towerdata[i].pos.y*height,game.mapObject.towerdata[i].size*1.75)
					if (hit) {
						if (event.target != document.getElementById("defaultCanvas0")) {
							return;
						} else {
							selectTower(i);
							return;
						}
					}
				}
			}
		}
	}
}
