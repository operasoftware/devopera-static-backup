/*
 * © 2009 ROBO Design
 * http://www.robodesign.ro
 *
 * $Date: 2009-04-21 14:43:04 +0300 $
 */

/**
 * @author <a lang="ro" href="http://www.robodesign.ro/mihai">Mihai Şucan</a>
 * @fileOverview The drawing tools for the paint application.
 */

/**
 * Holds the implementation of each drawing tool.
 */
var PaintTools = {};

/**
 * @class The drawing pencil.
 *
 * @param {Painter} app Reference to the main paint application object.
 */
PaintTools.pencil = function (app) {
  var _self   = this,
      context = app.buffer.context,
      update  = app.layerUpdate,
      mouse   = app.mouse;

  /**
   * Initialize the drawing operation.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousedown = function (ev) {
    context.beginPath();
    context.moveTo(ev.x_, ev.y_);
  };

  /**
   * Perform the drawing operation, while the user moves the mouse.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousemove = function (ev) {
    if (mouse.buttonDown) {
      context.lineTo(ev.x_, ev.y_);
      context.stroke();
    }
  };

  /**
   * End the drawing operation, once the user releases the mouse button.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mouseup = function (ev) {
    if (mouse.buttonDown) {
      _self.mousemove(ev);
      context.closePath();
      update();
    }
  };
};

/**
 * @class The rectangle tool.
 *
 * @param {Painter} app Reference to the main paint application object.
 */
PaintTools.rect = function (app) {
  var _self   = this,
      context = app.buffer.context,
      canvas  = app.buffer.canvas,
      update  = app.layerUpdate,
      mouse   = app.mouse;

  /**
   * Holds the starting point on the <var>x</var> axis of the image, for the 
   * current drawing operation.
   *
   * @private
   * @type Number
   */
  var x0 = 0;

  /**
   * Holds the starting point on the <var>y</var> axis of the image, for the 
   * current drawing operation.
   *
   * @private
   * @type Number
   */
  var y0 = 0;

  /**
   * Initialize the drawing operation, by storing the location of the pointer, 
   * the start position.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousedown = function (ev) {
    x0 = ev.x_;
    y0 = ev.y_;
  };

  /**
   * Perform the drawing operation, while the user moves the mouse.
   *
   * <p>Hold down the <kbd>Shift</kbd> key to draw a square.
   * <p>Press <kbd>Escape</kbd> to cancel the drawing operation.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousemove = function (ev) {
    if (!mouse.buttonDown) {
      return;
    }

    var x = Math.min(ev.x_,  x0),
        y = Math.min(ev.y_,  y0),
        w = Math.abs(ev.x_ - x0),
        h = Math.abs(ev.y_ - y0);

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!w || !h) {
      return;
    }

    // Constrain the shape to a square when the user holds down the Shift key.
    if (ev.shiftKey) {
      if (w > h) {
        if (y == ev.y_) {
          y -= w-h;
        }
        h = w;
      } else {
        if (x == ev.x_) {
          x -= h-w;
        }
        w = h;
      }
    }

    context.strokeRect(x, y, w, h);
  };

  /**
   * End the drawing operation, once the user releases the mouse button.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mouseup = function (ev) {
    if (mouse.buttonDown) {
      _self.mousemove(ev);
      update();
    }
  };

  /**
   * Allows the user to press <kbd>Escape</kbd> to cancel the drawing operation.
   *
   * @param {Event} ev The DOM Event object.
   *
   * @returns {Boolean} True if the drawing operation was cancelled, or false if 
   * not.
   */
  this.keydown = function (ev) {
    if (!mouse.buttonDown || ev.kid_ != 'Escape') {
      return false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    mouse.buttonDown = false;
  };
};

/**
 * @class The line tool.
 *
 * @param {Painter} app Reference to the main paint application object.
 */
PaintTools.line = function (app) {
  var _self   = this,
      context = app.buffer.context,
      canvas  = app.buffer.canvas,
      update  = app.layerUpdate,
      mouse   = app.mouse;

  /**
   * Holds the starting point on the <var>x</var> axis of the image, for the 
   * current drawing operation.
   *
   * @private
   * @type Number
   */
  var x0 = 0;

  /**
   * Holds the starting point on the <var>y</var> axis of the image, for the 
   * current drawing operation.
   *
   * @private
   * @type Number
   */
  var y0 = 0;

  /**
   * Initialize the drawing operation, by storing the location of the pointer, 
   * the start position.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousedown = function (ev) {
    x0 = ev.x_;
    y0 = ev.y_;
  };

  /**
   * Perform the drawing operation, while the user moves the mouse.
   *
   * <p>Hold down the <kbd>Shift</kbd> key to draw a straight 
   * horizontal/vertical line.
   * <p>Press <kbd>Escape</kbd> to cancel the drawing operation.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousemove = function (ev) {
    if (!mouse.buttonDown) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.moveTo(x0, y0);

    // Snap the line to be horizontal or vertical, when the Shift key is down.
    if (ev.shiftKey) {
      var diffx = Math.abs(ev.x_ - x0),
          diffy = Math.abs(ev.y_ - y0);

      if (diffx > diffy) {
        ev.y_ = y0;
      } else {
        ev.x_ = x0;
      }
    }

    context.lineTo(ev.x_, ev.y_);
    context.stroke();
    context.closePath();
  };

  /**
   * End the drawing operation, once the user releases the mouse button.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mouseup = function (ev) {
    if (mouse.buttonDown) {
      _self.mousemove(ev);
      update();
    }
  };

  /**
   * Allows the user to press <kbd>Escape</kbd> to cancel the drawing operation.
   *
   * @param {Event} ev The DOM Event object.
   *
   * @returns {Boolean} True if the drawing operation was cancelled, or false if 
   * not.
   */
  this.keydown = function (ev) {
    if (!mouse.buttonDown || ev.kid_ != 'Escape') {
      return false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    mouse.buttonDown = false;
  };
};

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:
