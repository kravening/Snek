var block, blackBlock, snake, pickup, squareSize, FrameTimer, direction, newDirection, addNew, cursors, score, gameSpeed, particleSystem, stageWidth, stageHeight;
 
var Game = {
 
    preload: function () {
        game.load.image('snake', './assets/images/snake3.png');     //load snake sprite
        game.load.image('pickup', './assets/images/pickup3.png');   //load pickup sprite
        game.load.image('block', './assets/images/block3.png');     //load background sprite
        game.load.image('blackBlock', './assets/images/black square.png');     //load blackBlock sprite
    },
    
    create: function () {
        particleSystem = []; // holds all particle arrays
        block = [];                                                 //block array
        snake = [];                                                 //snake array
        pickup = {};                                                //the pickup obj

        stageHeight = game.height;
        stageWidth = game.width;
        squareSize = 20;                                            //offset used for placing and moving sprites
        score = 0;                                                  //currentScore (quite useless atm)
        FrameTimer = 0;                                             //currentFrame
        gameSpeed = 3;                                              //lower value is an faster refresh rate
        direction = 'right';                                        //starting direction
        newDirection = null;                                        //next direction
        addNew = false;                                             // if this is true, allow addition to the body of the snake
        cursors = game.input.keyboard.createCursorKeys();           //ez arrow key input method!!

        this.generateBackgroundGrid();                              //function for placing the background grid
        this.generateSnake();                                       //function for setting up "sneek-man"
        this.generatePickup();                                      //function for placing a randomly positioned pickup
    
    },
    
    update: function () { //the game loop

        FrameTimer++;

        if (cursors.right.isDown && direction != 'left') {          // snake changes direction to the right
            newDirection = 'right';
        } else if (cursors.left.isDown && direction != 'right') {   // snake changes direction to the left
            newDirection = 'left';
        } else if (cursors.up.isDown && direction != 'down') {      // snake changes direction to the up
            newDirection = 'up';
        } else if (cursors.down.isDown && direction != 'up') {      // snake changes direction to the down
            newDirection = 'down';
        }
        if (FrameTimer % gameSpeed == 0) {
            pickupParticleSystem.update();

            var firstCell = snake[snake.length - 1],   //the head of the snake
                lastCell = snake.shift(),              //the mostest behindest body part of the snake
                oldLastCellx = lastCell.x,             //store mostest behindest position of the snake
                oldLastCelly = lastCell.y;             //same thing
            this.screenWrap(firstCell);                //function for checking if the snake is out of the stage
            if (newDirection) {                        //only if there is a new direction to go in
                direction = newDirection;              //set new direction
                newDirection = null;                   //set it back to null so it wont go back into this if unless a new direction is given
            }
    
            if (direction == 'right') {
                lastCell.x = firstCell.x + squareSize; //moves the snake to the right with an increment based on the square size
                lastCell.y = firstCell.y;              //no need to increment here
            } else if (direction == 'left') {
                lastCell.x = firstCell.x - squareSize; //moves the snake to the left with an increment based on the square size
                lastCell.y = firstCell.y;              //no need to increment here
            } else if (direction == 'up') {
                lastCell.x = firstCell.x;              //no need to increment here
                lastCell.y = firstCell.y - squareSize; //moves the snake upwards with an increment based on the square size
            } else if (direction == 'down') {
                lastCell.x = firstCell.x;              //no need to increment here
                lastCell.y = firstCell.y + squareSize; //moves the snake downwards with an increment based on the square size
            }

            this.pickupCollision(firstCell);           //function for checking if the snake's head's position is the same as that of the pickup
    
            this.selfCollision(firstCell);             //function for checking if the snake is colliding with hisself
    
            snake.push(lastCell);                      //places mostest behindest body part upfront.
            firstCell = lastCell;                      //for growing the snake

            if (addNew) {                                                        //only do this if an pickup was touched this frane
            snake.unshift(game.add.sprite(oldLastCellx, oldLastCelly, 'snake')); //adds a new bodypart to the snake
            addNew = false;                                                      //stops unecessary repeating of this if statement
            }
        } 
    },

    generateBackgroundGrid: function(){                                             //generates background
        var xTiles = stageWidth / squareSize,
            yTiles = stageHeight/ squareSize;
        for (var i = 0; i < xTiles; i++) {                                          //horizontal (max is based on window width / squaresize)
            for (var j = 0; j < yTiles; j++) {                                      //vertical (max is based on window height / squaresize)
                block[i] = game.add.sprite(i * squareSize, j*squareSize, 'block');  //places sprite
            }
        }
    },

    generateSnake: function(){
        var snakeLength = 10;                                                       // starting length of the snake

        for (var i = 0; i < snakeLength; i++) {
            snake[i] = game.add.sprite(((stageWidth / 2) - snakeLength * squareSize) + i * squareSize, stageHeight / 2, 'snake'); //generates the snake in the middle
        }
    },
 
 
    generatePickup: function () {                                                                       //function for placing a randomly positioned pickup
        var randomX = Math.floor(Math.random() * (stageWidth / squareSize)) * squareSize,               //randomise position for next pickup[
            randomY = Math.floor(Math.random() * (stageHeight / squareSize)) * squareSize;
 
        pickup = game.add.sprite(randomX, randomY, 'pickup');                    //place new pickup
    },
 
    pickupCollision: function (head) {                                           //function for checking if the snake's head's position is the same as that of the pickup
        if (head.x == pickup.x && head.y == pickup.y) {                          // check if pickup is in the snake's mouth
            pickupParticleSystem.generateNewParticleSet();
            pickup.destroy();                                                    //eat that pickup
            addNew = true;                                                       //allow for lengthening body
            this.generatePickup();                                               //need a new pickup to eat
            score++;                                                             //add to arbitrary score
        }
    },
 
    selfCollision: function (head) {                                             //function for checking if the snake is colliding with hisself
        for (var i = 0; i < snake.length - 1; i++) {
            if (head.x == snake[i].x && head.y == snake[i].y) {                  //checking for head body collision
                this.loadState('Menu');                                          //go to main menu
            }
        }
    },
 
    screenWrap: function (object) {                                      
        if (object.x >= stageWidth ) {                                           //fairly straightforward screenwrap 
            object.x = 0;
        }
        else if (object.x < 0) { 
            object.x = stageWidth;
        }
        if (object.y >= stageHeight) {
            object.y = 0;
        }
        else if (object.y < 0) {
            object.y = stageHeight;
        }
    },

    loadState: function(stateName){                                              //does what it says it does
        game.state.start(stateName);
    },
 
};

var pickupParticleSystem = { // a particle system that expels particles in a cross patern outwards from the pickup until it reaches the stage edges or until fully transparent
    update: function () {    //particle behaviour
        if(particleSystem.length != 0 && particleSystem != null){
            for (var i = particleSystem.length - 1; i >= 0; i--) 
            {
                if( particleSystem [i][0] != null){
                    particleSystem [i][0].x += squareSize;
                }
                if( particleSystem [i][1] != null){
                    particleSystem [i][1].x -= squareSize;
                }
                if( particleSystem [i][2] != null){
                    particleSystem [i][2].y += squareSize;
                }
                if( particleSystem [i][3] != null){
                    particleSystem [i][3].y -= squareSize;
                }

                for (var j = particleSystem[i].length - 1; j >= 0; j--) { // lowers transparency of images over time
                    Game.screenWrap(particleSystem[i][j]);
                    if(particleSystem [i][j].alpha <= 0){
                        particleSystem[i].pop;
                    }else{
                        particleSystem [i][j].alpha -= 0.05;
                    }
                }
            }
        }
    },

    generateNewParticleSet: function(){
        var newParticles = [];             // create a set of 4 new particles
        for (var i = 0; i < 4; i++) {
            newParticles[i] = game.add.sprite(pickup.x, pickup.y, 'pickup');
        }
        particleSystem.push(newParticles); // push new particles in particle array
    }, 
};