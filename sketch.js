/***************************************************************************
 * The extensions I included in this game are platforms, enemies,
 * and a particle emitter in the winning screen, as well as some minor 
 * enhancements (like game restart prompts, a warning to turn around
 * if you go too far left, and randomly-generated scenery).
 * 
 * The platform code uses the factory pattern, and the enemy code uses
 * a constructor function.
 * 
 * The most challenging part for me was definitely debugging, 
 * especially since this was my first time making a big project.
 * In something like this with many interrelated parts it can be 
 * very difficult to pinpoint the cause of a problem. 
 * 
 * This was also a great opportunity for me to learn though.
 * I had to restart a few times due to bugs, but each time I made my code
 * clearer and shorter.
 * I learned to split big problems up into many small, specialized functions,
 * and to make sure my code was intuitive and easy to follow.
 * This made debugging a lot easier, and I saved time on top of writing
 * better code.
 ***************************************************************************/



//Initialize global position variables
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

//Initialize global character state variables
var isLeft;
var isRight;
var jumping;
var isFalling;
var isPlummeting;
var game_score;
var lives;

function setup()
{
	textSize(21);
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	lives = 3;

	//This emitter will be used in the winning animation
	emitter = new Emitter(width/2, height-50, 0, -1, 10, color(255,127,127,100));
	emitter.emit(500,10000);

	startGame();
}

function startGame()
{

	//Starting positions
	gameChar_x = width/2;
	gameChar_y = floorPos_y;
	scrollPos = 0;
	gameChar_world_x = gameChar_x - scrollPos;
	treePos_y = height/2;


	//Default values, will change during game
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	jumping = false;
	game_score = 0;

	//Platforms and Enemies
	platforms = [];
	platforms.push(Platform(550,floorPos_y - 80,200));
	platforms.push(Platform(1100,floorPos_y - 100,300));
	platforms.push(Platform(2750,floorPos_y - 100,50));

	enemies = [];
	enemies.push(new Enemy(875, floorPos_y - 10, 50));
	enemies.push(new Enemy(2220, floorPos_y - 10, 200));
	enemies.push(new Enemy(2480, floorPos_y - 10, 200));
	enemies.push(new Enemy(2850, floorPos_y - 10, 100));

	//Clouds and mountains are generated randomly each game
	clouds = [];

	for(let i = 1; i < 3000; i = i + 300)
	{
		clouds.push({cloudPos_x: i + 50*random(), cloudPos_y: 100 + 50*random(), cloudScale: 1 + 2 * random()});
	}

    mountains = [];

	for(let i = 1; i < 3000; i = i + 700)
	{
		mountains.push({xpos1: i + 100 * random(), ypos1: floorPos_y, 
						xpos2: i + 200 * (1+random()), ypos2: floorPos_y - 200 * (1+random()),
						xpos3: i + 500 * (1+random()), ypos3: floorPos_y});
	}

	//The rest is placed manually

	trees_x = 
	[
		-2223, 
		-1500, 
		-1400, 
		-1200, 
		-500, 
		-100, 
		100, 
		250, 
		350, 
		1120, 
		1400, 
		1500, 
		2223
	];

    canyon = 
    [
        {x_pos:600, width:100},
      
        {x_pos:950, width:100},
      
        {x_pos:1950, width:100},
      
        {x_pos:1200, width:100},
      
        {x_pos:1800, width:100}
    ];

    collectables = 
    [
        {x_pos:width/2 + 320, 
         y_pos:height/2 + 100, 
         size: 50, 
         isFound: false},
      
        {x_pos:width/2 + 600, 
         y_pos:height/2 + 100, 
         size: 50, 
         isFound: false},
      
        {x_pos:width/2 + 1200, 
         y_pos:height/2 + 100, 
         size: 50, 
         isFound: false},
    ];

	flagpole = {x_pos:3000, isReached:false};
}

function draw()
{	
	//All these functions are defined later in the same order they appear here.

	push(); //For non-character elements

	drawBackground();

    translate(scrollPos,0);

    drawMountains();

	drawClouds();
  
    drawTrees();
  
	drawCanyons();

	drawPlatforms();
  
	drawCollectables();

	renderFlagpole();

	drawEnemies();

	pop(); //Now we draw the character
  
	drawGameChar();

	drawScore();

	drawLives();

	//Now we start checking

	checkLose();

	checkWin();

	checkPlayerDie();

	//And moving

	moveChar();

	gameChar_world_x = gameChar_x - scrollPos;
}

function drawBackground()
{
	background(100, 200, 255);

	noStroke();
    fill(171, 194, 167);
	rect(0, floorPos_y, width, height/4);
}

function drawMountains()
{
  for (let i = 0; i < mountains.length; i++)
      {
        let x1 = mountains[i].xpos1;
        let x2 = mountains[i].xpos2;
        let x3 = mountains[i].xpos3;
        
        let y1 = mountains[i].ypos1;
        let y2 = mountains[i].ypos2;
        let y3 = mountains[i].ypos3;
        
	      stroke(146, 177, 173);
	      fill(136, 153, 154);
	      triangle(x1, y1, 
                   x2, y2, 
                   x3, y3);
        stroke(255,255,255);
        fill(255, 255, 255); //snow
        triangle(x1+(2*(x2-x1)/3), y1+(2*(y2-y1)/3), 
                   x2, y2, 
                   x3+(2*(x2-x3)/3), y3+(2*(y2-y3)/3)); //snow only goes 1/3 of the way down the mountain
      }
}

function drawClouds()
{
    for (let i = 0; i < clouds.length; i++)
    {
        stroke(156, 255, 255);
	    fill(230, 246, 245);

		ellipse(clouds[i].cloudPos_x - 15*clouds[i].cloudScale, 
			clouds[i].cloudPos_y, 
			100 * clouds[i].cloudScale / 4, 
			100 * clouds[i].cloudScale / 4);

		ellipse(clouds[i].cloudPos_x, 
			clouds[i].cloudPos_y, 
			100 * clouds[i].cloudScale / 3, 
			100 * clouds[i].cloudScale / 3);

		ellipse(clouds[i].cloudPos_x + 15*clouds[i].cloudScale, 
			clouds[i].cloudPos_y, 
			100 * clouds[i].cloudScale / 4, 
			100 * clouds[i].cloudScale / 4);
				
    
    }
}

function drawTrees()
{
  for (let i = 0; i < trees_x.length; i++)
    {
        stroke(137, 198, 153);
	    fill(217, 201, 193);
	    ellipse(trees_x[i], treePos_y + 110, 40, 100);
	    fill(194, 223, 193);
	    ellipse(trees_x[i], treePos_y + 20, 120, 120);
	    fill(252, 219, 199);
	    ellipse(trees_x[i], treePos_y , 15, 15);
	    ellipse(trees_x[i] + 55, treePos_y + 45, 10, 10);
	    ellipse(trees_x[i] - 55, treePos_y + 140, 10, 10);
	    noStroke();
    }
}

function drawCanyons() //uses drawCanyon and checkCanyon
{
	for (let i = 0; i < canyon.length; i++)
    {
      drawCanyon(canyon[i]);

	  //We also check here to see if the player is over a canyon
	  //If so, then isPlummeting = true
	  checkCanyon(canyon[i]); 
    }
}

function drawCanyon(t_canyon)
{
    noStroke();
	fill(152, 175, 149);
	rect(t_canyon.x_pos, floorPos_y, t_canyon.width, height - floorPos_y);
	fill(109, 138, 105);
	ellipse(t_canyon.x_pos + 50, floorPos_y + 140, 100, 200);
	fill(78, 105, 74);
	ellipse(t_canyon.x_pos + 50, floorPos_y + 180, 100, 200);
}

function checkCanyon(t_canyon)
{
	//if you're on the floor and you're somewhere between the beginning and end of the canyon...
  if(
      (gameChar_y == floorPos_y) && 
      (t_canyon.x_pos <= gameChar_world_x) && 
      (gameChar_world_x <= t_canyon.x_pos+t_canyon.width)
    ) 
    {
	    isPlummeting = true; //Then you're dead
    }
}

function drawPlatforms() //uses Platform
{
	for(let i = 0; i < platforms.length; i++)
	{
		platforms[i].draw();
	}
}

function Platform(x, y, length) //Factory pattern
{
	let p = {
		x: x,
		y: y,
		length: length,
		draw: function(){
			strokeWeight(2);
			stroke(225, 252, 246);
			fill(172, 207, 184);
			rect(this.x, this.y-5, this.length, 20, 20, 15, 10, 10)
			fill(114, 186, 189);
			rect(this.x, this.y + 10, this.length, 10, 10, 15, 10, 10);
		},
		checkContact: function(gc_x, gc_y){
			if(gc_x > this.x && gc_x < this.x + this.length) //If character's x value lines up with the platform
			{
				let d = this.y - gc_y; 
				if(d >= 0 && d < 5) //If character is on the platform
				{
					return true;
				}
			}
			return false;
		}
	}

	return p;
}

function drawCollectables() //uses drawCollectable and checkCollectable
{
	for (let i = 0; i < collectables.length; i++)
    {
		//Since collectables disappear after they are collected,
		//We have to check them first
	
		checkCollectable(collectables[i]);
		
		if (collectables[i].isFound == false) 
		{
			drawCollectable(collectables[i]);
		}
    }
}

function drawCollectable(t_collectable)
{
    fill(244, 122, 208);
    rect(t_collectable.x_pos - 25, 
             t_collectable.y_pos, 
             t_collectable.size, 
             t_collectable.size);
	fill(253, 251, 140);
	noStroke();
	beginShape();
	vertex(t_collectable.x_pos - 10, t_collectable.y_pos + 10);
	vertex(t_collectable.x_pos, t_collectable.y_pos + 35);
	vertex(t_collectable.x_pos + 10, t_collectable.y_pos + 10);
	vertex(t_collectable.x_pos + 35, t_collectable.y_pos);
	vertex(t_collectable.x_pos + 10, t_collectable.y_pos - 8);
	vertex(t_collectable.x_pos, t_collectable.y_pos - 35);
	vertex(t_collectable.x_pos - 10, t_collectable.y_pos - 8);
	vertex(t_collectable.x_pos - 35, t_collectable.y_pos);
	endShape();
}

function checkCollectable(t_collectable)
{
    if 
	(
		(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < t_collectable.size) 
		&& 
		(t_collectable.isFound == false)
	)
    {
	    t_collectable.isFound = true;

		game_score += 1;
    }
}

function renderFlagpole()
{
	push();
	strokeWeight(3);
	stroke(0,0,0);
	line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
	fill(255,255,255);
	rect(flagpole.x_pos, floorPos_y - 250, 50, 50);
	fill(0,0,0);
	rect(flagpole.x_pos, floorPos_y - 250, 25, 25);
	rect(flagpole.x_pos+25, floorPos_y - 225, 25, 25);
	pop();
}

function checkFlagpole()
{
	let d = abs(gameChar_world_x - flagpole.x_pos);

	if(d < 15)
	{
		flagpole.isReached = true;
	}
}

function drawEnemies()
{
	for(let i = 0; i < enemies.length; i++)
	{
		enemies[i].draw();

		let isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);

		if(isContact)
		{
			isPlummeting = true;
		}
	}
}

function Enemy(x, y, range) //Constructor function
{
	this.x = x;
	this.y = y;
	this.range = range;

	this.currentX = x;
	
	this.inc = 1; //Will change to -1 when the enemy reaches the end of the range

	this.update = function()
	{
		this.currentX += this.inc;

		if(this.currentX >= this.x + this.range)
		{
			this.inc =  -1; //switch directions
		}
		else if(this.currentX < this.x)
		{
			this.inc = 1;
		}
	}

	this.draw = function()
	{
		this.update();
		strokeWeight(2);
		stroke(152, 79, 180);
		fill(142, 108, 187);
		ellipse(this.currentX, this.y - 20, 55, 55);
		fill(255);
		ellipse(this.currentX - 20, this.y - 25, 20, 20);
		ellipse(this.currentX + 20, this.y - 25, 20, 20);
		fill(0);
		ellipse(this.currentX - 20, this.y - 25, 5, 5);
		ellipse(this.currentX + 20, this.y - 25, 5, 5);
		ellipse(this.currentX, this.y - 20, 20, 30);
		fill(152, 79, 180);
		ellipse(this.currentX - 20, this.y + 5, 15, 10);
		ellipse(this.currentX + 20, this.y + 5, 15, 10);
	}

	this.checkContact = function(gc_x, gc_y)
	{
		let d = dist(gc_x, gc_y, this.currentX, this.y) //distance to enemy
	
		if(d < 20)
		{
			return true;
		}
		return false;
	}
}

function drawGameChar()
{

	//These are all different character poses, depending on the keys pressed
	if(isLeft)
	{
		faceLeft();
	}
	else if(isRight)
	{
		faceRight();
	}
	else if(isFalling || isPlummeting)
	{
		fall();
	}
	else
	{
		faceForward();
	}
}

function faceForward()
{
	strokeWeight(2);
	stroke(228, 109, 202);
	fill(230, 168, 202);
	ellipse(gameChar_x, gameChar_y - 25, 35, 45);
	fill(230, 168, 202);
	rect(gameChar_x - 12, gameChar_y - 70, 5, 5, 20, 15, 5, 5);
	rect(gameChar_x + 8, gameChar_y - 70, 5, 5, 20, 15, 5, 5);
	rect(gameChar_x - 12, gameChar_y - 70, 25, 25, 20, 15, 5, 5);

	strokeWeight(1);
	stroke(255,255,255);
	fill(42, 39, 56);
	rect(gameChar_x - 12, gameChar_y - 65, 10, 10, 20, 15, 5, 5);
	rect(gameChar_x + 4, gameChar_y - 65, 10, 10, 20, 15, 5, 5);
	fill(255, 255, 255);
	rect(gameChar_x - 12, gameChar_y - 65, 3, 3, 20, 15, 5, 5);
	rect(gameChar_x + 4, gameChar_y - 65, 3, 3, 20, 15, 5, 5);

	strokeWeight(2);
	stroke(228, 109, 202);
	fill(230, 168, 202);
	ellipse(gameChar_x - 12, gameChar_y - 5, 10, 5);
	ellipse(gameChar_x + 12, gameChar_y - 5, 10, 5);
}

function faceLeft()
{
	if(isFalling)
	{
		strokeWeight(2);
		stroke(228, 109, 202);
		fill(230, 168, 202);
		ellipse(gameChar_x + 6, gameChar_y - 25, 35, 45);

		fill(230, 168, 202);
		rect(gameChar_x + 4, gameChar_y - 75, 18, 5, 20, 15, 5, 5);
		rect(gameChar_x - 12, gameChar_y - 70, 25, 25, 20, 15, 5, 5);

		strokeWeight(1);
		stroke(255,255,255);
		fill(42, 39, 56);
		rect(gameChar_x - 14, gameChar_y - 65, 10, 10, 20, 15, 5, 5);
		fill(255, 255, 255);
		rect(gameChar_x - 14, gameChar_y - 65, 3, 3, 20, 15, 5, 5);

		strokeWeight(2);
		stroke(228, 109, 202);
		fill(230, 168, 202);
		ellipse(gameChar_x + 18, gameChar_y - 5, 10, 10);
	}
	else
	{
		strokeWeight(2);
		stroke(228, 109, 202);
		fill(230, 168, 202);
		ellipse(gameChar_x, gameChar_y - 28, 35, 35);

		fill(230, 168, 202);
		rect(gameChar_x + 8, gameChar_y - 70, 10, 5, 20, 15, 5, 5);
		rect(gameChar_x - 12, gameChar_y - 70, 25, 25, 20, 15, 5, 5);

		strokeWeight(1);
		stroke(255,255,255);
		fill(42, 39, 56);
		rect(gameChar_x - 12, gameChar_y - 65, 10, 10, 20, 15, 5, 5);
		fill(255, 255, 255);
		rect(gameChar_x - 12, gameChar_y - 65, 3, 3, 20, 15, 5, 5);

		strokeWeight(2);
		stroke(228, 109, 202);
		fill(230, 168, 202);
		ellipse(gameChar_x + 12, gameChar_y - 10, 10, 5);
		ellipse(gameChar_x - 14, gameChar_y - 8, 10, 15);
	}
}

function faceRight()
{
	if(isFalling)
	{
		strokeWeight(2);
		stroke(228, 109, 202);
		fill(230, 168, 202);
		ellipse(gameChar_x - 6, gameChar_y - 25, 35, 45);

		fill(230, 168, 202);
		rect(gameChar_x - 20, gameChar_y - 75, 18, 5, 20, 15, 5, 5);
		rect(gameChar_x - 12, gameChar_y - 70, 25, 25, 20, 15, 5, 5);

		strokeWeight(1);
		stroke(255,255,255);
		fill(42, 39, 56);
		rect(gameChar_x + 4, gameChar_y - 65, 10, 10, 20, 15, 5, 5);
		fill(255, 255, 255);
		rect(gameChar_x + 4, gameChar_y - 65, 3, 3, 20, 15, 5, 5);

		strokeWeight(2);
		stroke(228, 109, 202);
		fill(230, 168, 202);
		ellipse(gameChar_x - 20, gameChar_y - 5, 10, 10);
	}
	else
	{
		strokeWeight(2);
		stroke(228, 109, 202);
		fill(230, 168, 202);
		ellipse(gameChar_x, gameChar_y - 28, 35, 35);

		fill(230, 168, 202);
		rect(gameChar_x - 18, gameChar_y - 70, 10, 5, 20, 15, 5, 5);
		rect(gameChar_x - 12, gameChar_y - 70, 25, 25, 20, 15, 5, 5);

		strokeWeight(1);
		stroke(255,255,255);
		fill(42, 39, 56);
		rect(gameChar_x + 4, gameChar_y - 65, 10, 10, 20, 15, 5, 5);
		fill(255, 255, 255);
		rect(gameChar_x + 4, gameChar_y - 65, 3, 3, 20, 15, 5, 5);

		strokeWeight(2);
		stroke(228, 109, 202);
		fill(230, 168, 202);
		ellipse(gameChar_x - 12, gameChar_y - 10, 10, 5);
		ellipse(gameChar_x + 14, gameChar_y - 8, 10, 15);
	}
}

function fall()
{
	strokeWeight(2);
	stroke(228, 109, 202);
	fill(230, 168, 202);
	ellipse(gameChar_x, gameChar_y - 35, 35, 30);

	fill(230, 168, 202);
	rect(gameChar_x - 12, gameChar_y - 75, 5, 10, 20, 15, 5, 5);
	rect(gameChar_x + 8, gameChar_y - 75, 5, 10, 20, 15, 5, 5);
	rect(gameChar_x - 12, gameChar_y - 70, 25, 25, 20, 15, 5, 5);

	strokeWeight(1);
	stroke(255,255,255);
	fill(42, 39, 56);
	rect(gameChar_x - 12, gameChar_y - 68, 10, 10, 20, 15, 5, 5);
	rect(gameChar_x + 4, gameChar_y - 68, 10, 10, 20, 15, 5, 5);
	fill(255, 255, 255);
	rect(gameChar_x - 12, gameChar_y - 68, 3, 3, 20, 15, 5, 5);
	rect(gameChar_x + 4, gameChar_y - 68, 3, 3, 20, 15, 5, 5);

	strokeWeight(2);
	stroke(228, 109, 202);
	fill(230, 168, 202);
	ellipse(gameChar_x - 12, gameChar_y - 25, 10, 5);
	ellipse(gameChar_x + 12, gameChar_y - 25, 10, 5);
}

function drawScore()
{
	fill(255);
	textSize(20);
	text("Score: " + game_score,20,20);
}

function drawLives()
{
	let stars = ''; //Star emojis
	for(let i = 0; i < lives; i++)
	{
		stars = stars + '⭐'; 
	}
	textSize(20);
	text("Lives: " + stars, 20, 40);
}

function checkLose()
{
	if(lives < 0)
	{
		background(0,0,0);
		push();
		textSize(50);
		stroke(255,0,0);
		fill(0);
		strokeWeight(3);
		text('Game over.', width/3, height/3);
		text('Press space to try again.', width/5, height/2);
		pop();

		if(jumping) //if the user presses the spacebar
		{
			setup();
		}
		return;
	}
}

function checkWin()
{
	if(flagpole.isReached)
	{
		background(0, 0, 0);
		push();
		textSize(50);
		stroke(255,0,0);
		fill(128,128,255);
		strokeWeight(3);
		text('   You won!', width/3, height/3); 
		text('Press space to play again', width/5, height/2);
		text('     Your score is: ' + game_score, width/4, (2*height)/3);
		pop();

		emitter.draw(); //celebration

		if(jumping) //If they press space
		{
			setup();
		}
		return;
	}
	else
	{
		checkFlagpole(); // This function modifies flagpole.isReached
	}
}

function particle(x, y, xsp, ysp, size, color) //particles have x/y position, x/y speed, size and color
{
  this.x = x;
  this.y = y;
  this.xsp = xsp;
  this.ysp = ysp;
  this.size = size;
  this.color = color;
  
  this.age = 0; //They die with time
  
  this.draw = function()
  {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }
  
  this.update = function()
  {
    this.x += this.xsp;
    this.y += this.ysp;
    this.age++;
  }
}

function Emitter(x,y,xsp,ysp,size,color) //Emitter passes these values to its particles
{
  this.x = x;
  this.y = y;
  this.xsp = xsp;
  this.ysp = ysp;
  this.size = size;
  this.color = color;
  
  this.particles = [];
  
  this.population = 0;
  this.lifetime = 0;
  
  this.newParticle = function() //return new particle with random position and speed
  {
    return new particle(
          random(this.x-10, this.x+10), 
          random(this.y-10, this.y+10), 
          random(this.xsp-1, this.xsp+1), 
          random(this.ysp-1, this.ysp+1), 
          this.size, 
          this.color
        );
  }
  
  this.emit = function(population,lifetime) //setup function, decide how many particles to emit and for how long
  {
    this.population = population;
    this.lifetime = lifetime;
    
    for(let i = 0; i < population; i++)
    {
      this.particles.push(this.newParticle());
    }
  }
  
  this.draw = function()
  {
    let numdead = 0;
    
    for(let i = this.particles.length-1; i >= 0; i--)
      {
        this.particles[i].draw();
        this.particles[i].update();
        if(this.particles[i].age > random(0, this.lifetime)) //random so they don't all die at the same time
          {
            this.particles.splice(i,1); //remove dead particle
            numdead++;
          }
      }
    if(numdead > 0)
      {
        for(let i = 0; i < numdead; i++)
          {
            this.particles.push(this.newParticle()); //spawn new particle for every dead one
          }
      }
  }
}

function checkPlayerDie()
{

	if((gameChar_y > 750)) //If you have plummeted off the screen
	{
		lives -= 1;

		if(lives > 0)
		{
			startGame();
		}
	}
}

function moveChar()
{
	if(isLeft)
	{
		if(gameChar_world_x >= 0) //If you are in a legal zone
		{
			if(gameChar_x > width * 0.2)
			{
				gameChar_x -= 5;
			}
			else
			{
				scrollPos += 5;
			}
		}
		else //You've gone the wrong way
		{
			push();
			textSize(50);
			stroke(255,0,0);
			fill(0,0,0);
			text('Turn around!', width/3, height/3);
			pop();
		}
	}
	
	if(isRight)
	{
		//Right is the right way, so we don't need to do the same check as above
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5;
		}
	}

	let onPlatform = false; //Default to false, we will check soon

	for(let i = 0; i < platforms.length; i++)
	{
		if(platforms[i].checkContact(gameChar_world_x, gameChar_y))
		{
			onPlatform = true; ///we're on a platform
			break;
		}
	}

	if (jumping) //if spacebar was just pressed
	{
		isFalling = true;
		jumping = false;
	}

	if(!onPlatform && !isPlummeting) //another case where we want to check isFalling
	{
		isFalling = true;
	}

	if(isFalling)
	{
		if(gameChar_y < floorPos_y && !onPlatform)
		{
			gameChar_y += 2;
		}
		else //we're not actually falling
		{
			isFalling = false;
		}
	}

	if(isPlummeting)
	{
		gameChar_y += 5;
	}
}

function keyPressed() 
{
	if (keyCode === LEFT_ARROW) 
    {
		isLeft = true;
	} 
    else if (keyCode === RIGHT_ARROW) 
    {
		isRight = true;
	} 
    else if (keyCode == 32)  //Spacebar
    {
		if(!isFalling) //If you're not in midair...
		{
			gameChar_y -= 150;
		}
		jumping = true; 
	}

}

function keyReleased()
{
	if (keyCode === LEFT_ARROW) {
		isLeft = false;
	} else if (keyCode === RIGHT_ARROW) {
		isRight = false;
	}
}







