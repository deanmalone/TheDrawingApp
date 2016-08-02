$(function () {

    var canvas;                 // the HTML5 canvas object
    var context;                // the drawing context for the canvas
    var canvasHeight = 572;     // fixed height
    var canvasWidth = 980;      // fixed width

    var defaultfillStyle        = "solid";      // solid line style
    var defaultstrokeStyle      = "#555555";    // color of line
    var defaultlineWidth        = 4;            // line thickness
    var defaultlineCap          = "round";      // line cap style

    var isDrawing = false;      // indicates if drawing is currently in progress
    var currentSegment;         // The current drawing segment
    var currentX = 0;           // The current x co-ordinate
    var currentY = 0;           // The current y co-ordinate

    // Reference the auto-generated proxy for the hub.  
    var drawingHubProxy = $.connection.drawingHub;

    init = function () {

        // create HTML5 canvas object
        canvas = document.createElement("canvas");
        canvas.setAttribute("id", "canvas");
        canvas.height = canvasHeight;
        canvas.width = canvasWidth;
        canvas.style = "border:1px solid #000000; display:block; padding-left: 0; padding-right: 0; margin-left: auto; margin-right: auto;";

        document.getElementById('canvasDiv').appendChild(canvas);

        // obtain the 2D context object
        context = canvas.getContext("2d");
        context.fillStyle = defaultfillStyle;
        context.strokeStyle = defaultstrokeStyle;
        context.lineWidth = defaultlineWidth;
        context.lineCap = defaultlineCap;

        // Add mouse events
        $('#canvas').mousedown(function (e) {
            // Mouse down location
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;

            isDrawing = true;
            context.beginPath();
            context.moveTo(x, y);

            // new segment
            currentSegment = Segment(x, y, context.strokeStyle, context.lineWidth);
            currentX = x;
            currentY = y;
        });

        $('#canvas').mousemove(function (e) {
            if (isDrawing) {
                var x = e.pageX - this.offsetLeft;
                var y = e.pageY - this.offsetTop;

                context.lineTo(x, y);
                context.stroke();

                // Add point to segment
                currentSegment.points.push({ "x": x, "y": y })
                currentX = x;
                currentY = y;
            }
        });

        $('#canvas').mouseup(function (e) {
            if (isDrawing) {
                isDrawing = false;
                onFinishSegment();
            }
        });

        $('#canvas').mouseleave(function (e) {
            if (isDrawing) {
                isDrawing = false;
                onFinishSegment();
            }
        });

        // Add touch events
        $('#canvas').on("touchstart", function (e) {
            e.preventDefault();

            // touch start location
            var touchEvent = e.originalEvent.changedTouches[0];
            var x = touchEvent.pageX - this.offsetLeft;
            var y = touchEvent.pageY - this.offsetTop;

            //isDrawing = true;
            context.beginPath();
            context.moveTo(x, y);

            // new segment
            currentSegment = Segment(x, y, context.strokeStyle, context.lineWidth);
            currentX = x;
            currentY = y;
        });

        $('#canvas').on("touchmove", function (e) {
            e.preventDefault();

            var touchEvent = e.originalEvent.changedTouches[0];
            var x = touchEvent.pageX - this.offsetLeft;
            var y = touchEvent.pageY - this.offsetTop;

            context.lineTo(x, y);
            context.stroke();

            // Add point to segment
            currentSegment.points.push({ "x": x, "y": y })
            currentX = x;
            currentY = y;
        });

        $('#canvas').on("touchend", function (e) {
            e.preventDefault();
            onFinishSegment();
        });

        $("#clear-button").on("click", function (e) {
            drawingHubProxy.server.clearDrawing();
        });
    };

    // Hub callback function to clear the canvas
    drawingHubProxy.client.clearCanvas = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Hub callback function to update drawing with new drawingSegment
    drawingHubProxy.client.drawSegment = function (drawingSegment) {

        if (drawingSegment != null) {

            var originalstrokeStyle = context.strokeStyle;
            var originallineWidth = context.lineWidth;

            // drawing the segment received from other client (via Hub)
            context.beginPath();
            context.moveTo(drawingSegment.start.x, drawingSegment.start.y);
            context.strokeStyle = drawingSegment.color;
            context.lineWidth = drawingSegment.size;

            for (var i = 0; i < drawingSegment.points.length; i += 1) {
                context.lineTo(drawingSegment.points[i].x, drawingSegment.points[i].y);
                context.stroke();
            }

            context.closePath();

            // set context back to what this client had before update
            context.moveTo(currentX, currentY);
            context.strokeStyle = originalstrokeStyle;
            context.lineWidth = originallineWidth;
        }
    };

    // Start the Hub connection and initialise canvas
    $.connection.hub.start().done(function () {
        init();
    });

    function onFinishSegment() {
        // if a mouseup or touchend event occurs immediately after mousedown or touchstart events,
        // i.e. without any move events, then draw a single dot.
        if (currentSegment.points.length === 0) {
            // draw a dot using lineTo with offset of 1 pixel
            context.lineTo(currentX + 1, currentY + 1);
            context.stroke();
            currentSegment.points.push({ "x": currentX + 1, "y": currentY + 1 })
        }

        // finish segment and send to server
        context.closePath();
        drawingHubProxy.server.updateDrawing(currentSegment);
        currentSegment = null;
    }

    function Segment(xpos, ypos, color, size) {
        return {
            start: { x: xpos, y: ypos },
            color: color,
            size: size,
            points: []
        }
    }

});