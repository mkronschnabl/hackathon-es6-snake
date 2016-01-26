config =
    BACKGROUND_COLOR: 'lightgrey'
    SQUARE_SIZE: 10
    INITIAL_SNAKE_COLOR: 'red'
    INITIAL_SPEED: 500

window.startGame = ->
    playground = new Playground 20
    playground.addSnake 15, new Position(2, 2), Direction.right
    playground.addSnake 15, new Position(8, 8), Direction.right

class Graphics
    constructor: (@gridSize, @squareSize) ->
        @canvas = document.getElementById 'canvas'
        @context = canvas.getContext '2d'

    initCanvas: ->
        sizeInPx = (@gridSize * @squareSize)
        @canvas.width = sizeInPx
        @canvas.height = sizeInPx
        @canvas.style.backgroundColor = config.BACKGROUND_COLOR

    paintRect: (position, color) ->
        x = position.x * @squareSize
        y = position.y * @squareSize

        @context.fillStyle = color
        @context.fillRect(x, y, @squareSize, @squareSize)

    clearRect: (position) ->
        x = position.x * @squareSize
        y = position.y * @squareSize

        @context.clearRect(x, y, @squareSize, @squareSize)

    paintAll: (color) ->
        fullSize = @gridSize * @squareSize
        @context.fillStyle = color
        @context.fillRect(0, 0, fullSize, fullSize)


class Playground
    constructor: (gridSize) ->
        @graphics = new Graphics gridSize, config.SQUARE_SIZE
        @graphics.initCanvas()
        @snakes = []
        @isGameOver = false

    addSnake: (size, position, direction) ->
        snake = new Snake @, @graphics, size, position, direction
        snake.paint()
        @snakes.push snake

    isValidPosition: (newPosition) ->
        isValid = true
        for snake in @snakes
            for position in snake.body
                isValid = false if position.equals newPosition
        return isValid

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

class Snake
    constructor: (@playground, @graphics, initialSize, startPosition, startDirection) ->
        @color = config.INITIAL_SNAKE_COLOR
        @size = initialSize
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
        if @body.length is @size
            lastPosition = @body.shift()
            @graphics.clearRect lastPosition

        @calculateHeadPosition()
        if not @playground.isValidPosition(@position) or @playground.isGameOver
            return @playground.gameOver()

        @body.push @position.clone()
        @paint()
        setTimeout @move, config.INITIAL_SPEED

    calculateHeadPosition: ->
        @position.x += @direction.x
        @position.y += @direction.y

    paint: ->
        @graphics.paintRect @position, @color



