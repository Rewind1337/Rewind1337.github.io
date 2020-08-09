let $c, $m, $p;
let resolution = 2;
let whosTurn = Math.round(Math.random());
let global_turn = 0;
let weapons = [
	{
		name: "Default",
		damage: 30,
		hitWidth: 25,
		strenth: 0.0006,
		mouseOver: false,
		selected: true,
	},
	{
		name: "Mortar",
		damage: 25,
		hitWidth: 40,
		strenth: 0.0003,
		mouseOver: false,
		selected: false,
	},
	{
		name: "Sniper",
		damage: 50,
		hitWidth: 10,
		strenth: 0.00001,
		mouseOver: false,
		selected: false,
	},
	{
		name: "Digger",
		damage: 10,
		hitWidth: 48,
		strenth: 0.002,
		mouseOver: false,
		selected: false,
	},
	{
		name: "Builder",
		damage: 10,
		hitWidth: 48,
		strenth: -0.002,
		mouseOver: false,
		selected: false,
	},
];

function setup () {
    $c = createCanvas(1200, 800, P2D);
    $c.parent("#mainContain");
    colorMode(HSL, 360, 100, 100, 1);
    angleMode(DEGREES);
    frameRate(60);
	noStroke();

	$m = generateRandomMap();
	let pos = Math.round(3 + Math.random() * 7);
	$p = [
		new Player(0, Math.random() * 360, width/pos),
		new Player(1, Math.random() * 360, width/pos*(pos-1)),
	]
	global_turn ++;
}

function draw () {
	background(0);
	
	for (let x = (width/2) - 250, i=0; x < (width/2) + 250; x+=100, i++) {
		if (mouseX > x && mouseX <= x+100) {
			if (mouseY >= 60 && mouseY <= 100) {
				weapons[i].mouseOver = true;
				cursor(HAND);
			} else {
				weapons[i].mouseOver = false;
				cursor(ARROW);
			}
		} else {
			weapons[i].mouseOver = false;
		}
	}

	for (let i = 0; i < $p.length; i++) {
		$p[i].tick();
	}

	for (let i = 0; i < $m.length; i++) {
		let mapped, nextmapped, lastmapped;
		if (i != $m.length - 1)
			nextmapped = map($m[i + 1], 0, 1, 0, height);
		if (i != 0)
			lastmapped = map($m[i - 1], 0, 1, 0, height);
		mapped = map($m[i], 0, 1, 0, height);

		let col = map($m[i], 0, 1, 0, 360);
		fill(col, 100, 50);
		stroke(col, 100, 50);
		rect(i * resolution, height - mapped, resolution, mapped);
	}

	for (let i = 0; i < $p.length; i++) {
		$p[i].drawBullets();
		$p[i].drawOverTerrain();
		$p[i].drawUI();
	}

	push();
		stroke(0, 0, 100);
		fill(0, 0, 100, 0.2);
		rect((width/2) - 250, 0, 500, 100);
		translate((width/2), 30);
		stroke(0, 0, 100);
		fill(0, 0, 100);
		textAlign(CENTER);
		textSize(32);
		text("ROUND " + global_turn, 0, 0);
	pop();

	push();
		translate((width/2) - 250, 60);
		for (let i = 0; i < 5; i++) {
			if (weapons[i].selected) {
				stroke(0, 0, 100);
				fill(i*60, 50, 50);
				rect(0, 0, 100, 40);
				push();
					translate(0, 20);
					fill(i*60, weapons[i].mouseOver * 100, 50 + !weapons[i].mouseOver*50);
					stroke(i*60, weapons[i].mouseOver * 100, 50 + !weapons[i].mouseOver*50);
					textSize(18);
					textAlign(CENTER);
					text(weapons[i].name, 50, 6);
				pop();
				translate(100, 0);
			} else {
				stroke(0, 0, 100);
				fill(i*60, weapons[i].mouseOver * 20, weapons[i].mouseOver*50);
				rect(0, 0, 100, 40);
				push();
					translate(0, 20);
					fill(i*60, weapons[i].mouseOver * 100, 50 + !weapons[i].mouseOver*50);
					stroke(i*60, weapons[i].mouseOver * 100, 50 + !weapons[i].mouseOver*50);
					textSize(18);
					textAlign(CENTER);
					text(weapons[i].name, 50, 6);
				pop();
				translate(100, 0);
			}
		}
	pop();
}

function generateRandomMap() {
    let halfmap = [];
    let map = [];
    for (let x = 0; x < width/2; x+=resolution) {
    	halfmap.push(((noise(x * 0.005)) * 0.5) + 0.25);
    }
    map.push(...halfmap);
    for (let i = halfmap.length - 1; i >= 0; i--) {
    	map.push(halfmap[i]);
    }
    return map;
}

function switchTurns() {
	$p[whosTurn].moveLeft = false;
	$p[whosTurn].moveRight = false;
	$p[whosTurn].aimLeft = false;
	$p[whosTurn].aimRight = false;
	$p[whosTurn].chargingUp = false;
	$p[whosTurn].ableToShoot = true;

	if (whosTurn == 0)
		whosTurn = 1;
	else
		whosTurn = 0;

	$p[whosTurn].moveLeft = false;
	$p[whosTurn].moveRight = false;
	$p[whosTurn].aimLeft = false;
	$p[whosTurn].aimRight = false;
	$p[whosTurn].chargingUp = false;
	$p[whosTurn].ableToShoot = true;

	updateWeaponSelect();

	global_turn ++;
	if (global_turn % 5 == 0) {
		earthquake(Math.round(global_turn / 3));
	}
}

function earthquake(damp = 3) {
	for (let x = 0; x < $m.length; x++) {
		let avg = 0.5;
		for (let i = -damp; i <= damp; i++) {
			if ($m[x + i])
				avg += $m[x + i];
		}
		$m[x] = avg / ((2*damp)+2);
	}
}

function updateWeaponSelect() {
	for (let i = 0; i < weapons.length; i++) {
		weapons[i].selected = false;
	}
	weapons[$p[whosTurn].weaponSelected].selected = true;
}

function terraform(x, hitWidth, strength, dealDamage, damage) {
	let initialX = Math.round(x / resolution);
	let initialY = 1 - (mouseY / height);
	for (let i = -hitWidth; i < hitWidth; i++) {
		$m[initialX + i] -= strength * Math.pow(hitWidth - abs(i), 1.3)

		if ($m[initialX + i] > 0.999)
			$m[initialX + i] = 0.999;
		if ($m[initialX + i] < 0.001)
			$m[initialX + i] = 0.001;
	}

	if (dealDamage) {
		let playersHit = [];
		for (let i = 0; i < $p.length; i++) {
			let distanceToPlayer = abs(x - $p[i].x)/resolution;
			if (distanceToPlayer <= ((hitWidth) * resolution) / 2) {
				playersHit.push({id: i, range: distanceToPlayer});
			}
		}

		for (let i = 0; i < playersHit.length; i++) {
			let newDamage = map(playersHit[i].range, 0, (hitWidth) * resolution, 1, 0) * damage;
			$p[playersHit[i].id].takeDamage(newDamage);
		}
	}
}

function mousePressed() {
	if ($p[whosTurn].ableToShoot) {
		for (let x = width/2 - 250, i = 0; x < width/2 + 250; x+= 100, i ++) {
			if (mouseX >= x && mouseX <= x + 100) {
				if (mouseY >= 60 && mouseY <= 100) {
					for (let j = 0; j < weapons.length; j++) {
						weapons[j].selected = false;
					}
					weapons[i].selected = true;
					$p[whosTurn].weaponSelected = i;
				}
			}
		}
	}
}

function keyPressed () {
	if (key == "a" || key == "A") {$p[whosTurn].moveLeft = true;$p[whosTurn].moveRight = false;}
	if (key == "d" || key == "D") {$p[whosTurn].moveRight = true;$p[whosTurn].moveLeft = false;}
	if (keyCode === LEFT_ARROW) {$p[whosTurn].aimLeft = true;$p[whosTurn].aimRight = false;}
	if (keyCode === RIGHT_ARROW) {$p[whosTurn].aimRight = true;$p[whosTurn].aimLeft = false;}
	if (key == " ") {$p[whosTurn].chargingUp = true;}
}

function keyReleased () {
	if (key == "a" || key == "A") {$p[whosTurn].moveLeft = false;}
	if (key == "d" || key == "D") {$p[whosTurn].moveRight = false;}
	if (keyCode === LEFT_ARROW) {$p[whosTurn].aimLeft = false;}
	if (keyCode === RIGHT_ARROW) {$p[whosTurn].aimRight = false;}
	if (key == " ") {if ($p[whosTurn].chargingUp) {$p[whosTurn].fire();}}
}

class Player {
	constructor (playerIndex, color, position) {
		this.playerIndex = playerIndex;
		this.color = color;
		this.x = position;
		this.h = $m[Math.floor(position / resolution)];

		this.weaponSelected = 0;

		this.alive = true;
		this.hp = 100;
		this.maxhp = 100;

		this.moveLeft = false;
		this.moveRight = false;

		this.aimLeft = false;
		this.aimRight = false;

		this.chargingUp = false;
		this.charge = 10;

		this.angle = 180;

		this.bulletsInPlay = undefined;
		this.bulletTrail = [];
		this.lastShot = {angle: 180, charge: 0};
		this.lastHit = {x: 0, y: 0, hitWidth: 0};

		this.ableToShoot = true;

		this.shotsFired = 0;
	}

	explode() {
		this.alive = false;
		this.hp = 0;
	}

	takeDamage(dmg) {
		if (dmg >= this.hp) {
			this.explode();
		} else {
			this.hp -= dmg;
		}
	}

	draw() {
		if (this.alive) {
			push();
				stroke(0, 0, 0);
				fill(this.color, 100, 80);
				circle(this.x, height - this.h * height, 25);
			pop();
		}
	}

	drawOverTerrain() {
		if (this.alive) {
			if (this.playerIndex == whosTurn) {	
				push();
					noStroke();
					fill(0, 0, 100, 0.25);
					circle(this.x, height - this.h * height, 100);
					push();
						translate(this.x, height - this.h * height);
						strokeWeight(2);
						stroke(0, 0, 100);
						line(sin(-this.angle) * 15, cos(-this.angle) * 15, sin(-this.angle) * 50, cos(-this.angle) * 50)
						strokeWeight(1.5);
						line(sin(-this.angle) * 55, cos(-this.angle) * 55, sin(-this.angle) * 60, cos(-this.angle) * 60)
						strokeWeight(1);
						line(sin(-this.angle) * 70, cos(-this.angle) * 70, sin(-this.angle) * 75, cos(-this.angle) * 75)
						strokeWeight(0.5);
						line(sin(-this.angle) * 90, cos(-this.angle) * 90, sin(-this.angle) * 95, cos(-this.angle) * 95)
						strokeWeight(2 + this.charge/200);
						stroke(0, 100, 50);
						line(sin(-this.angle) * 15 * ((this.charge-10)/90), cos(-this.angle) * 15 * ((this.charge-10)/90), sin(-this.angle) * 50 * ((this.charge-10)/90), cos(-this.angle) * 50 * ((this.charge-10)/90))
					pop();
				pop();
			}

			push();
				stroke(this.color, 100, 70);
				fill(this.color, 100, 50);
				textSize(24);
				textAlign(LEFT);
				text(this.angle%360 + "°", this.x - 60, height - this.h * height - 50);
				if (this.charge > 10) {
					textAlign(RIGHT);
					text(this.charge + "%", this.x + 60, height - this.h * height - 50);
				}
				if (this.shotsFired > 0) {
					stroke(this.color, 20, 70);
					fill(this.color, 20, 50);
					textAlign(LEFT);
					text(this.lastShot.angle%360 + "°", this.x - 60, height - this.h * height - 85);
					textAlign(RIGHT);
					text(this.lastShot.charge + "%", this.x + 60, height - this.h * height - 85);
				}
			pop();
		}
	}

	drawUI() {
		let offset = {};
		if (this.playerIndex == 0) {
			offset.top = height-120;
			offset.left = 0;
		} else if (this.playerIndex == 1) {
			offset.top = height-120;
			offset.left = width-200;
		}

		push();
			translate(offset.left, offset.top);
			stroke(0, 0, 0);
			fill(0, 0, 100, 0.75);
			rect(0, 0, 200, 120);

			fill(0, 0, 0);
			textSize(20);
			text("Spieler " + (this.playerIndex+1), 5, 20);
			translate(0, 30);
			rect(0, 0, 200, 20);
			fill(0, 100, 50);
			rect(0, 0, (this.hp / this.maxhp) * 200, 20);
			translate(0, 36);
			textSize(16);
			fill(0, 0, 0);
			textAlign(LEFT);
			text("" + Math.round(this.hp) + " HP", 0, 0);
			textAlign(RIGHT);
			text("VON " + Math.round(this.maxhp), 200, 0);
		pop();

		fill(0, 100, 75, 0.15);
		noStroke();
		circle(this.lastHit.x, this.lastHit.y, this.lastHit.hitWidth * resolution * 2.25);
		circle(this.lastHit.x, this.lastHit.y, this.lastHit.hitWidth * resolution * 1.75);
		circle(this.lastHit.x, this.lastHit.y, this.lastHit.hitWidth * resolution * 1.2);
		circle(this.lastHit.x, this.lastHit.y, this.lastHit.hitWidth * resolution / 1.8);
	}

	drawBullets() {
		if (this.alive) {
			if (this.bulletsInPlay != undefined) {
				let trail, mapX;
				switch (this.weaponSelected) {
					case 0:
					case 3:
					case 4:
						if (this.bulletsInPlay.x < 0 || this.bulletsInPlay.x > width) {
						this.bulletsInPlay = undefined;
						switchTurns();
						return;
					}
					trail = {x: this.bulletsInPlay.x, y: this.bulletsInPlay.y};
					this.bulletTrail.push(trail);
					this.bulletsInPlay.upvelocity += 0.08;

					if (this.bulletsInPlay.upvelocity < -0.01) {
						this.bulletsInPlay.upvelocity *= 0.95;
					}
					if (this.bulletsInPlay.upvelocity >= -0.1 && this.bulletsInPlay.upvelocity < 0.00) {
						this.bulletsInPlay.upvelocity = 0.1;
					}
					if (this.bulletsInPlay.upvelocity > 0.00) {
						this.bulletsInPlay.upvelocity *= 1.05;
					}
					this.bulletsInPlay.sidevelocity *= 0.998;

					this.bulletsInPlay.y += this.bulletsInPlay.upvelocity;
					this.bulletsInPlay.x += this.bulletsInPlay.sidevelocity;

					stroke(255, 255, 255, 0.75);
					fill(255, 255, 255, 0.5);
					circle(this.bulletsInPlay.x, this.bulletsInPlay.y, 12);

					mapX = Math.round(this.bulletsInPlay.x / resolution);
					if (this.bulletsInPlay.y > (height - ($m[mapX]*height))) {
						terraform(mapX * resolution,
							weapons[this.weaponSelected].hitWidth,
							weapons[this.weaponSelected].strenth,
							true,
							weapons[this.weaponSelected].damage);
						this.lastHit.x = this.bulletsInPlay.x;
						this.lastHit.y = this.bulletsInPlay.y;
						this.lastHit.hitWidth = weapons[this.weaponSelected].hitWidth;
						this.bulletsInPlay = undefined;
						switchTurns();
					}
					break;
					case 1:
						if (this.bulletsInPlay.x < 0 || this.bulletsInPlay.x > width) {
						this.bulletsInPlay = undefined;
						switchTurns();
						return;
					}
					trail = {x: this.bulletsInPlay.x, y: this.bulletsInPlay.y};
					this.bulletTrail.push(trail);
					this.bulletsInPlay.upvelocity += 0.3;

					this.bulletsInPlay.y += this.bulletsInPlay.upvelocity;
					this.bulletsInPlay.x += this.bulletsInPlay.sidevelocity;

					stroke(255, 255, 255, 0.75);
					fill(255, 255, 255, 0.5);
					circle(this.bulletsInPlay.x, this.bulletsInPlay.y, 12);

					mapX = Math.round(this.bulletsInPlay.x / resolution);
					if (this.bulletsInPlay.y > (height - ($m[mapX]*height))) {
						terraform(mapX * resolution,
							weapons[this.weaponSelected].hitWidth,
							weapons[this.weaponSelected].strenth,
							true,
							weapons[this.weaponSelected].damage);
						this.lastHit.x = this.bulletsInPlay.x;
						this.lastHit.y = this.bulletsInPlay.y;
						this.lastHit.hitWidth = weapons[this.weaponSelected].hitWidth;
						this.bulletsInPlay = undefined;
						switchTurns();
					}
					break;
					case 2:
						if (this.bulletsInPlay.x < 0 || this.bulletsInPlay.x > width) {
						this.bulletsInPlay = undefined;
						switchTurns();
						return;
					}
					if (this.bulletsInPlay.y < 0 || this.bulletsInPlay.y > height) {
						this.bulletsInPlay = undefined;
						switchTurns();
						return;
					}
					trail = {x: this.bulletsInPlay.x, y: this.bulletsInPlay.y};
					this.bulletTrail.push(trail);

					this.bulletsInPlay.y += this.bulletsInPlay.upvelocity;
					this.bulletsInPlay.x += this.bulletsInPlay.sidevelocity;

					stroke(255, 255, 255, 0.75);
					fill(255, 255, 255, 0.5);
					circle(this.bulletsInPlay.x, this.bulletsInPlay.y, 12);

					mapX = Math.round(this.bulletsInPlay.x / resolution);
					if (this.bulletsInPlay.y > (height - ($m[mapX]*height))) {
						terraform(mapX * resolution,
							weapons[this.weaponSelected].hitWidth,
							weapons[this.weaponSelected].strenth,
							true,
							weapons[this.weaponSelected].damage);
						this.lastHit.x = this.bulletsInPlay.x;
						this.lastHit.y = this.bulletsInPlay.y;
						this.lastHit.hitWidth = weapons[this.weaponSelected].hitWidth;
						this.bulletsInPlay = undefined;
						switchTurns();
					}
					break;
				}
			}

			for (let i = 0; i < this.bulletTrail.length; i++) {
				fill(this.playerIndex* 180, 100, 50, 0.8);
				circle(this.bulletTrail[i].x, this.bulletTrail[i].y, 2);
			}
		}
	}

	fire() {
		if (this.ableToShoot) {
			if (this.playerIndex == whosTurn) {
				this.bulletsInPlay = {x: 0, y: 0,};
				this.bulletsInPlay.x = this.x;
				this.bulletsInPlay.y = height - (this.h * height);
				this.bulletsInPlay.angle = this.angle;
				this.bulletsInPlay.charge = this.charge;
				switch (this.weaponSelected) {
					case 0:
					case 1:
					case 3:
					case 4:
						this.bulletsInPlay.upvelocity = cos(this.angle) * this.charge /3;
						this.bulletsInPlay.sidevelocity = (sin(this.angle) * this.charge /3) * -1;
					break;
					case 2:
						this.bulletsInPlay.upvelocity = cos(this.angle) * this.charge;
						this.bulletsInPlay.sidevelocity = (sin(this.angle) * this.charge) * -1;
				}

				this.bulletTrail = [];

				this.lastShot.angle = this.angle;
				this.lastShot.charge = this.charge;

				this.shotsFired ++;

				this.charge = 10;
				this.chargingUp = false;

				this.ableToShoot = false;
			}
		}
	}

	tick() {
		if (!this.alive) {
			this.ableToShoot = false;
			return;
		}

		if (this.ableToShoot) {
			if (this.playerIndex == whosTurn) {	
				if (this.ableToShoot) {
					if (this.chargingUp && this.charge < 100) {
						this.charge += 1;
					}
					if (this.charge == 100) {
						this.fire();
					}
				}

				if (this.moveLeft) {
					if (abs($m[Math.floor(this.x / resolution)] - $m[Math.floor(this.x / resolution) - 1]) < 0.005) {
						this.x --;
					}
				}

				if (this.moveRight) {
					if (abs($m[Math.floor(this.x / resolution)] - $m[Math.floor(this.x / resolution) + 1]) < 0.005) {
						this.x ++;
					}
				}

				if (this.aimLeft) {
					this.angle --;
				}

				if (this.aimRight) {
					this.angle ++;
				}
			}
		}

		this.h = $m[Math.floor(this.x / resolution)];

		this.draw();
	}
}

