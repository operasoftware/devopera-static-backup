/*
 * © 2009 ROBO Design
 * http://www.robodesign.ro
 *
 * $Date: 2009-04-21 14:47:43 +0300 $
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
      update  = app.layerUpdate;

  /**
   * Tells if the user has started the drawing operation or not.
   *
   * @private
   * @type Boolean
   */
  var started = false;

  /**
   * Initialize the drawing operation.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousedown = function (ev) {
    context.beginPath();
    context.moveTo(ev.x_, ev.y_);
    started = true;
  };

  /**
   * Perform the drawing operation, while the user moves the mouse.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousemove = function (ev) {
    if (started) {
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
    if (started) {
      _self.mousemove(ev);
      context.closePath();
      update();
      started = false;
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
      update  = app.layerUpdate;

  /**
   * Tells if the user has started the drawing operation or not.
   *
   * @private
   * @type Boolean
   */
  var started = false;

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
    started = true;
    x0 = ev.x_;
    y0 = ev.y_;
  };

  /**
   * Perform the drawing operation, while the user moves the mouse.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousemove = function (ev) {
    if (!started) {
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

    context.strokeRect(x, y, w, h);
  };

  /**
   * End the drawing operation, once the user releases the mouse button.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mouseup = function (ev) {
    if (started) {
      _self.mousemove(ev);
      update();
      started = false;
    }
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
      update  = app.layerUpdate;

  /**
   * Tells if the user has started the drawing operation or not.
   *
   * @private
   * @type Boolean
   */
  var started = false;

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
    started = true;
    x0 = ev.x_;
    y0 = ev.y_;
  };

  /**
   * Perform the drawing operation, while the user moves the mouse.
   *
   * @param {Event} ev The DOM Event object.
   */
  this.mousemove = function (ev) {
    if (!started) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.moveTo(x0, y0);
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
    if (started) {
      _self.mousemove(ev);
      update();
      started = false;
    }
  };
};

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:
