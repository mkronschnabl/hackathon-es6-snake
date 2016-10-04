// Generated by CoffeeScript 1.9.1
(function() {
  var Direction, Food, Graphics, Playground, Position, Snake, config, graphics,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  config = {
    BACKGROUND_COLOR: 'lightgrey',
    SQUARE_SIZE: 10,
    INITIAL_SNAKE_COLOR: 'red',
    INITIAL_FOOD_COLOR: 'green',
    INITIAL_SPEED: 200
  };

  graphics = null;

  window.startGame = function() {
    var playground;
    graphics = new Graphics();
    playground = new Playground(60);
    playground.addSnake(5, new Position(2, 2), Direction.right, ['red', 'black'], [37, 38, 39, 40]);
    return playground.addFood(15);
  };

  Graphics = (function() {
    function Graphics() {
      this.squareSize = config.SQUARE_SIZE;
      this.canvas = document.getElementById('canvas');
      this.context = canvas.getContext('2d');
    }

    Graphics.prototype.paintGrid = function(gridSize) {
      var sizeInPx;
      sizeInPx = gridSize * this.squareSize;
      this.canvas.width = sizeInPx;
      this.canvas.height = sizeInPx;
      return this.canvas.style.backgroundColor = config.BACKGROUND_COLOR;
    };

    Graphics.prototype.paintRect = function(gridPosition, color) {
      var canvasPosition;
      canvasPosition = this.calculateCanvasPosition(gridPosition);
      this.context.fillStyle = color;
      return this.context.fillRect(canvasPosition.x, canvasPosition.y, this.squareSize, this.squareSize);
    };

    Graphics.prototype.clearRect = function(gridPosition) {
      var canvasPosition;
      canvasPosition = this.calculateCanvasPosition(gridPosition);
      return this.context.clearRect(canvasPosition.x, canvasPosition.y, this.squareSize, this.squareSize);
    };

    Graphics.prototype.calculateCanvasPosition = function(gridPosition) {
      return new Position(gridPosition.x * this.squareSize, gridPosition.y * this.squareSize);
    };

    Graphics.prototype.paintAll = function(color, gridSize) {
      var fullSize;
      fullSize = gridSize * this.squareSize;
      this.context.fillStyle = color;
      return this.context.fillRect(0, 0, fullSize, fullSize);
    };

    Graphics.prototype.paintText = function(text, color) {
      this.context.fillStyle = color;
      this.context.font = '48px serif';
      return this.context.fillText(text, 50, 50);
    };

    return Graphics;

  })();

  Playground = (function() {
    function Playground(gridSize1) {
      this.gridSize = gridSize1;
      this.snakes = [];
      this.dishes = [];
      this.isGameOver = false;
      graphics.paintGrid(this.gridSize);
    }

    Playground.prototype.addSnake = function(size, position, direction, colors, keyCodes) {
      var snake;
      snake = new Snake(this, size, position, direction, colors, keyCodes);
      this.snakes.push(snake);
      return snake.move();
    };

    Playground.prototype.addFood = function(number) {
      var food, i, j, position, ref, results;
      results = [];
      for (i = j = 0, ref = number; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        position = this.createRandomPosition();
        food = Food.apple(position);
        this.dishes.push(food);
        food.paint();
        position = this.createRandomPosition();
        food = Food.orange(position);
        this.dishes.push(food);
        food.paint();
        position = this.createRandomPosition();
        food = Food.banana(position);
        this.dishes.push(food);
        results.push(food.paint());
      }
      return results;
    };

    Playground.prototype.createRandomPosition = function() {
      var x, y;
      x = this.createRandomInteger();
      y = this.createRandomInteger();
      return new Position(x, y);
    };

    Playground.prototype.createRandomInteger = function() {
      return Math.floor(Math.random() * (this.gridSize - 1));
    };

    Playground.prototype.checkPosition = function(newPosition) {
      var isValid;
      if (this.isGameOver) {
        return false;
      }
      isValid = this.isValidPosition(newPosition);
      if (!isValid) {
        this.gameOver();
      }
      return isValid;
    };

    Playground.prototype.isValidPosition = function(newPosition) {
      var j, k, len, len1, position, ref, ref1, snake;
      if (newPosition.x < 0 || newPosition.x === this.gridSize || newPosition.y < 0 || newPosition.y === this.gridSize) {
        return false;
      }
      ref = this.snakes;
      for (j = 0, len = ref.length; j < len; j++) {
        snake = ref[j];
        ref1 = snake.body;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          position = ref1[k];
          if (position.equals(newPosition)) {
            return false;
          }
        }
      }
      return true;
    };

    Playground.prototype.getFood = function(position) {
      var food, j, len, ref;
      ref = this.dishes;
      for (j = 0, len = ref.length; j < len; j++) {
        food = ref[j];
        if (position.equals(food.position)) {
          return food.amount;
        }
      }
      return 0;
    };

    Playground.prototype.gameOver = function() {
      this.isGameOver = true;
      graphics.paintAll('black', this.gridSize);
      return setTimeout((function(_this) {
        return function() {
          graphics.paintAll('white', _this.gridSize);
          return graphics.paintText('GAME OVER!', 'black');
        };
      })(this), 500);
    };

    return Playground;

  })();

  Position = (function() {
    function Position(x1, y1) {
      this.x = x1;
      this.y = y1;
    }

    Position.prototype.clone = function() {
      return new Position(this.x, this.y);
    };

    Position.prototype.equals = function(otherPosition) {
      return otherPosition.x === this.x && otherPosition.y === this.y;
    };

    return Position;

  })();

  Direction = (function() {
    function Direction(name, x1, y1) {
      this.name = name;
      this.x = x1;
      this.y = y1;
    }

    Direction.left = new Direction('left', -1, 0);

    Direction.up = new Direction('up', 0, -1);

    Direction.right = new Direction('right', 1, 0);

    Direction.down = new Direction('down', 0, 1);

    return Direction;

  })();

  Food = (function() {
    function Food(amount, position1, color1) {
      this.amount = amount;
      this.position = position1;
      this.color = color1;
    }

    Food.prototype.paint = function() {
      return graphics.paintRect(this.position, this.color);
    };

    Food.apple = function(position) {
      return new Food(1, position, 'green');
    };

    Food.orange = function(position) {
      return new Food(3, position, 'orange');
    };

    Food.banana = function(position) {
      return new Food(7, position, 'yellow');
    };

    return Food;

  })();

  Snake = (function() {
    function Snake(playground1, initialSize, startPosition, startDirection, colors1, keyCodes) {
      this.playground = playground1;
      this.colors = colors1;
      this.move = bind(this.move, this);
      this.colorIndex = 0;
      this.expectedSize = initialSize;
      this.position = startPosition;
      this.direction = startDirection;
      this.body = [this.position.clone()];
      window.addEventListener('keydown', (function(_this) {
        return function(event) {
          switch (event.keyCode) {
            case keyCodes[0]:
              return _this.direction = Direction.left;
            case keyCodes[1]:
              return _this.direction = Direction.up;
            case keyCodes[2]:
              return _this.direction = Direction.right;
            case keyCodes[3]:
              return _this.direction = Direction.down;
          }
        };
      })(this));
    }

    Snake.prototype.move = function() {
      if (this.body.length === this.expectedSize) {
        this.cutTail();
      }
      this.calculateHeadPosition();
      if (!this.playground.checkPosition(this.position)) {
        return;
      }
      this.eat();
      this.grow();
      this.paint();
      return setTimeout(this.move, config.INITIAL_SPEED);
    };

    Snake.prototype.eat = function() {
      return this.expectedSize += this.playground.getFood(this.position);
    };

    Snake.prototype.grow = function() {
      return this.body.push(this.position.clone());
    };

    Snake.prototype.cutTail = function() {
      var lastPosition;
      lastPosition = this.body.shift();
      return graphics.clearRect(lastPosition);
    };

    Snake.prototype.calculateHeadPosition = function() {
      this.position.x += this.direction.x;
      return this.position.y += this.direction.y;
    };

    Snake.prototype.getColor = function() {
      var color;
      color = this.colors[this.colorIndex];
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
      return color;
    };

    Snake.prototype.paint = function() {
      return graphics.paintRect(this.position, this.getColor());
    };

    return Snake;

  })();

}).call(this);