"use strict";

const config = {
    BACKGROUND_COLOR: 'lightgrey',
    SQUARE_SIZE: 10,
    INITIAL_SNAKE_COLOR: 'red',
    INITIAL_FOOD_COLOR: 'green',
    INITIAL_SPEED: 200
};

let graphics = null;

window.startGame = () => {
    let playground;
    graphics = new Graphics();
    playground = new Playground(60);
    playground.addFood(5);
    playground.addSnake(5, new Position(2, 2), Direction.right, ['red', 'black'], [37, 38, 39, 40]);
};


class Graphics {
    constructor () {
        this.squareSize = config.SQUARE_SIZE;
        this.canvas = document.getElementById('canvas');
        this.context = canvas.getContext('2d');
    }

    paintGrid (gridSize) {
        let sizeInPx = gridSize * this.squareSize;
        this.canvas.width = sizeInPx;
        this.canvas.height = sizeInPx;
        this.canvas.style.backgroundColor = config.BACKGROUND_COLOR;
    }

    paintRect (gridPosition, color) {
        let canvasPosition = this.calculateCanvasPosition(gridPosition);
        this.context.fillStyle = color;
        this.context.fillRect(canvasPosition.x, canvasPosition.y, this.squareSize, this.squareSize);
    }

    clearRect (gridPosition) {
        let canvasPosition = this.calculateCanvasPosition(gridPosition);
        this.context.clearRect(canvasPosition.x, canvasPosition.y, this.squareSize, this.squareSize);
    }

    calculateCanvasPosition (gridPosition) {
        return new Position(gridPosition.x * this.squareSize, gridPosition.y * this.squareSize);
    }

    paintAll (color, gridSize) {
        let fullSize = gridSize * this.squareSize;
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, fullSize, fullSize);
    }

    paintText (text, color) {
        this.context.fillStyle = color;
        this.context.font = '48px serif';
        this.context.fillText(text, 50, 50);
    }
}


class Playground {
    constructor (gridSize1) {
        this.gridSize = gridSize1;
        this.snakes = [];
        this.dishes = [];
        this.isGameOver = false;

        graphics.paintGrid(this.gridSize);
    }

    addSnake (size, position, direction, colors, keyCodes) {
        let snake = new Snake(this, size, position, direction, colors, keyCodes);
        this.snakes.push(snake);
        snake.move();
    }

    addFood (number) {
        let results = [];

        let createFood = (creator) => {
            let food = creator(this.createRandomPosition());
            this.dishes.push(food);
            food.paint();
        };

        for (let i = 0; i <= number; i++) {
            createFood(Food.apple);
            createFood(Food.orange);
            createFood(Food.banana);
        }

        return results;
    }

    createRandomPosition () {
        let x = this.createRandomInteger();
        let y = this.createRandomInteger();
        return new Position(x, y);
    }

    createRandomInteger () {
        return Math.floor(Math.random() * (this.gridSize - 1));
    }

    checkPosition (newPosition) {
        if (this.isGameOver) {
            return false;
        }

        let isValid = this.isValidPosition(newPosition);
        if (!isValid) {
            this.gameOver();
        }

        return isValid;
    }

    isValidPosition (newPosition) {
        if (newPosition.x < 0 || newPosition.x === this.gridSize || newPosition.y < 0 || newPosition.y === this.gridSize) {
            return false;
        }

        for (let snake of this.snakes) {
            for (let position of snake.body) {
                if (position.equals(newPosition)) {
                    return false;
                }
            }
        }

        return true;
    }

    checkFood () {
        if (this.dishes.length === 0) {
            this.gameWon();
            return false;
        } else {
            return true;
        }
    }

    getFood (position) {
        let index = this.dishes.findIndex((food) => {
            return position.equals(food.position)
        });

        if (index !== -1) {
            let food = this.dishes[index];
            this.dishes.splice(index, 1);
            return food.amount;
        } else {
            return 0;
        }
    }

    gameOver () {
        this.isGameOver = true;
        graphics.paintAll('black', this.gridSize);
        setTimeout(() => {
            graphics.paintAll('white', this.gridSize);
            graphics.paintText('GAME OVER!', 'black');
        }, 500);
    }

    gameWon () {
        graphics.paintAll('yellow', this.gridSize);
        setTimeout(() => {
            graphics.paintAll('red', this.gridSize);
            setTimeout(() => {
                graphics.paintAll('blue', this.gridSize);
                graphics.paintText('YOU ARE A WINNER!', 'white');
            }, 500);
        }, 500);
    }
}


class Position {
    constructor(x1, y1) {
        this.x = x1;
        this.y = y1;
    }

    clone() {
        return new Position(this.x, this.y);
    }

    equals(otherPosition) {
        return otherPosition.x === this.x && otherPosition.y === this.y;
    }
}


class Direction {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
}
Direction.left = new Direction('left', -1, 0);
Direction.up = new Direction('up', 0, -1);
Direction.right = new Direction('right', 1, 0);
Direction.down = new Direction('down', 0, 1);


class Food {
    constructor (amount, position1, color1) {
        this.amount = amount;
        this.position = position1;
        this.color = color1;
    }

    paint () {
        graphics.paintRect(this.position, this.color);
    }

    static apple (position) {
        return new Food(1, position, 'green');
    }

    static orange (position) {
        return new Food(3, position, 'orange');
    }

    static banana (position) {
        return new Food(7, position, 'yellow');
    }
}


class Snake {
    constructor (playground1, initialSize, startPosition, startDirection, colors1, keyCodes) {
        this.playground = playground1;
        this.colors = colors1;
        this.colorIndex = 0;
        this.expectedSize = initialSize;
        this.position = startPosition;
        this.direction = startDirection;
        this.body = [this.position.clone()];

        window.addEventListener('keydown', (event) => {
            switch (event.keyCode) {
                case keyCodes[0]:
                    return this.direction = Direction.left;
                case keyCodes[1]:
                    return this.direction = Direction.up;
                case keyCodes[2]:
                    return this.direction = Direction.right;
                case keyCodes[3]:
                    return this.direction = Direction.down;
            }
        })
    }

    move () {
        if (this.body.length === this.expectedSize) {
            this.cutTail();
        }

        this.calculateHeadPosition();

        if (!this.playground.checkPosition(this.position) || !this.playground.checkFood()) {
            return;
        }

        this.eat();
        this.grow();
        this.paint();

        setTimeout(() => {
            this.move()
        }, config.INITIAL_SPEED);
    }

    eat () {
        this.expectedSize += this.playground.getFood(this.position);
    }

    grow () {
        this.body.push(this.position.clone());
    }

    cutTail () {
        var lastPosition = this.body.shift();
        graphics.clearRect(lastPosition);
    }

    calculateHeadPosition () {
        this.position.x += this.direction.x;
        this.position.y += this.direction.y;
    }

    getColor () {
        let color = this.colors[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % this.colors.length;
        return color;
    }

    paint () {
        graphics.paintRect(this.position, this.getColor());
    }
}
