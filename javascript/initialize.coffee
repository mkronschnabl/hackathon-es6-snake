window.startGame = ->
    graphics = new Graphics(20, 10)

class Grid
    constructor: (@size) ->

class Graphics
    constructor: (gridSize, @squareSize) ->
        sizeInPx = (gridSize * @squareSize)
        canvas = document.getElementById 'canvas'
        canvas.width = sizeInPx
        canvas.height = sizeInPx
        @context = canvas.getContext '2d'

    paintRect: (x, y, color) ->
        x *= @squareSize
        y *= @squareSize

        @context.fillStyle = color
        @context.fillRect(x, y, @squareSize, @squareSize)






