config =
    BACKGROUND_COLOR: 'lightgrey'
    SQUARE_SIZE: 10
    INITIAL_SNAKE_COLOR: 'red'
    INITIAL_FOOD_COLOR: 'green'
    INITIAL_SPEED: 200

graphics = null

window.startGame = ->
    graphics = new Graphics()
    playground = new Playground 60
    playground.addSnake 5, new Position(2, 2), Direction.right, ['red', 'black'], [37, 38, 39, 40]
    playground.addSnake 5, new Position(58, 58), Direction.left, ['blue', 'yellow'], [65, 87, 68, 83]
    playground.addFood 15


class Graphics
    constructor: ->
        @squareSize = config.SQUARE_SIZE
        @canvas = document.getElementById 'canvas'
        @context = canvas.getContext '2d'

    paintGrid: (gridSize) ->
        sizeInPx = gridSize * @squareSize
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

    paintAll: (color, gridSize) ->
        fullSize = gridSize * @squareSize
        @context.fillStyle = color
        @context.fillRect 0, 0, fullSize, fullSize

    paintText: (text, color) ->
        @context.fillStyle = color
        @context.font = '48px serif'
        @context.fillText text, 50, 50


class Playground
    constructor: (@gridSize) ->
        @snakes = []
        @dishes = []
        @isGameOver = false

        graphics.paintGrid @gridSize

    addSnake: (size, position, direction, colors, keyCodes) ->
        snake = new Snake this, size, position, direction, colors, keyCodes
        @snakes.push snake
        snake.move()

    addFood: (number) ->
        for i in [0..number]
            position = @createRandomPosition()
            food = Food.apple position
            @dishes.push food
            food.paint()

            position = @createRandomPosition()
            food = Food.orange position
            @dishes.push food
            food.paint()

            position = @createRandomPosition()
            food = Food.banana position
            @dishes.push food
            food.paint()

    createRandomPosition: ->
        x = @createRandomInteger()
        y = @createRandomInteger()

        return new Position x, y

    createRandomInteger: ->
        return Math.floor(Math.random() * (@gridSize - 1))

    checkPosition: (newPosition) ->
        return false if @isGameOver

        isValid = @isValidPosition newPosition
        @gameOver() unless isValid

        return isValid

    isValidPosition: (newPosition) ->
        if newPosition.x < 0 or newPosition.x is @gridSize or newPosition.y < 0 or newPosition.y is @gridSize
            return false

        for snake in @snakes
            for position in snake.body
                return false if position.equals newPosition

        return true

    getFood: (position) ->
        for food in @dishes
            if position.equals food.position
                return food.amount

        return 0

    gameOver: ->
        @isGameOver = true
        graphics.paintAll 'black', @gridSize
        setTimeout =>
            graphics.paintAll 'white', @gridSize
            graphics.paintText 'GAME OVER!', 'black'
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
    constructor: (@amount, @position, @color) ->

    paint: ->
        graphics.paintRect @position, @color

    @apple: (position) ->
        return new Food 1, position, 'green'

    @orange: (position) ->
        return new Food 3, position, 'orange'

    @banana: (position) ->
        return new Food 7, position, 'yellow'




class Snake
    constructor: (@playground, initialSize, startPosition, startDirection, @colors, keyCodes) ->
        @colorIndex = 0
        @expectedSize = initialSize
        @position = startPosition
        @direction = startDirection
        @body = [@position.clone()]

        window.addEventListener 'keydown', (event) =>
            switch event.keyCode
                when keyCodes[0] then @direction = Direction.left
                when keyCodes[1] then @direction = Direction.up
                when keyCodes[2] then @direction = Direction.right
                when keyCodes[3] then @direction = Direction.down

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
        graphics.clearRect lastPosition

    calculateHeadPosition: ->
        @position.x += @direction.x
        @position.y += @direction.y

    getColor: ->
        color = @colors[@colorIndex]
        @colorIndex = (@colorIndex + 1) % @colors.length
        return color

    paint: ->
        graphics.paintRect @position, @getColor()



