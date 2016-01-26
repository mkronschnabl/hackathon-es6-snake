config =
    BACKGROUND_COLOR: 'lightgrey'
    SQUARE_SIZE: 10
    INITIAL_SNAKE_COLOR: 'red'
    INITIAL_FOOD_COLOR: 'green'
    INITIAL_SPEED: 200

window.startGame = ->
    playground = new Playground 50
    playground.addSnake 15, new Position(2, 2), Direction.right
    # playground.addSnake 15, new Position(8, 8), Direction.right
    playground.addFood 1, new Position(10, 10)
    playground.addFood 1, new Position(12, 12)
    playground.addFood 1, new Position(4, 14)


class Graphics
    constructor: (@gridSize, @squareSize) ->
        @canvas = document.getElementById 'canvas'
        @context = canvas.getContext '2d'

    initCanvas: ->
        sizeInPx = @gridSize * @squareSize
        @canvas.width = sizeInPx
        @canvas.height = sizeInPx
        @canvas.style.backgroundColor = config.BACKGROUND_COLOR

    paintRect: (gridPosition, color) ->
        canvasPosition = @calculateCanvasPosition gridPosition
        @context.fillStyle = color
        @context.fillRect canvasPosition.x, canvasPosition.y, @squareSize, @squareSize

    clearRect: (gridPosition) ->
        canvasPosition = @calculateCanvasPosition gridPosition
        @context.clearRect canvasPosition.x, canvasPosition.y, @squareSize, @squareSize

    calculateCanvasPosition: (gridPosition) ->
        return new Position gridPosition.x * @squareSize, gridPosition.y * @squareSize

    paintAll: (color) ->
        fullSize = @gridSize * @squareSize
        @context.fillStyle = color
        @context.fillRect 0, 0, fullSize, fullSize


class Playground
    constructor: (gridSize) ->
        @graphics = new Graphics gridSize, config.SQUARE_SIZE
        @graphics.initCanvas()
        @snakes = []
        @dishes = []
        @isGameOver = false

    addSnake: (size, position, direction) ->
        snake = new Snake @, @graphics, size, position, direction
        snake.paint()
        @snakes.push snake

    addFood: (amount, position) ->
        food = new Food @graphics, amount, position
        food.paint()
        @dishes.push food

    checkPosition: (newPosition) ->
        return false if @isGameOver

        isValid = @isValidPosition newPosition
        @gameOver() unless isValid

        return isValid

    isValidPosition: (newPosition) ->
        return false if @isGameOver
        isValid = true
        for snake in @snakes
            for position in snake.body
                isValid = false if position.equals newPosition
        return isValid

    getFood: (position) ->
        for food in @dishes
            if position.equals food.position
                return food.amount

        return 0

    gameOver: ->
        @isGameOver = true
        @graphics.paintAll 'black'
        setTimeout =>
            @graphics.paintAll 'white'
        , 500

class Position
    constructor: (@x, @y) ->

    clone: ->
        return new Position @x, @y

    equals: (otherPosition) ->
        otherPosition.x is @x and otherPosition.y is @y

class Direction
    constructor: (@name, @x, @y) ->
    @left: new Direction('left', -1, 0)
    @up: new Direction('up', 0, -1)
    @right: new Direction('right', 1, 0)
    @down: new Direction('down', 0, 1)

class Food
    constructor: (@graphics, @amount, @position) ->
        @color = config.INITIAL_FOOD_COLOR

    paint: ->
        @graphics.paintRect @position, @color

class Snake
    constructor: (@playground, @graphics, initialSize, startPosition, startDirection) ->
        @color = config.INITIAL_SNAKE_COLOR
        @expectedSize = initialSize
        @position = startPosition
        @direction = startDirection
        @body = [@position.clone()]

        window.addEventListener 'keydown', (event) =>
            switch event.keyCode
                when 37 then @direction = Direction.left
                when 38 then @direction = Direction.up
                when 39 then @direction = Direction.right
                when 40 then @direction = Direction.down

        @move()

    move: =>
        if @body.length is @expectedSize
            @cutTail()

        @calculateHeadPosition()

        return unless @playground.checkPosition @position

        @eat()
        @grow()
        @paint()

        setTimeout @move, config.INITIAL_SPEED

    eat: ->
        @expectedSize += @playground.getFood @position

    grow: ->
        @body.push @position.clone()

    cutTail: ->
        lastPosition = @body.shift()
        @graphics.clearRect lastPosition

    calculateHeadPosition: ->
        @position.x += @direction.x
        @position.y += @direction.y

    paint: ->
        @graphics.paintRect @position, @color



