/*
 * © 2009 ROBO Design
 * http://www.robodesign.ro
 *
 * $Date: 2009-04-21 14:31:15 +0300 $
 */

/**
 * @author <a lang="ro" href="http://www.robodesign.ro/mihai">Mihai Şucan</a>
 * @fileOverview The paint application core code.
 */

/**
 * @class The paint tool application object.
 */
function Painter () {
  var _self = this;

  /**
   * Holds the buffer canvas and context references.
   * @type Object
   */
  this.buffer = {canvas: null, context: null};

  /**
   * Holds the current layer ID, canvas and context references.
   * @type Object
   */
  this.layer = {id: null, canvas: null, context: null};

  /**
   * The instance of the active tool object.
   *
   * @type Object
   * @see Painter#tool_default holds the ID of the tool which is activated when 
   * the application loads.
   * @see PaintTools The object which holds the implementation of each drawing 
   * tool.
   */
  this.tool = null;

  /**
   * The default tool ID.
   *
   * @type String
   * @see PaintTools The object which holds the implementation of each drawing 
   * tool.
   */
  this.tool_default = 'line';

  /**
   * Initialize the paint application.
   * @private
   */
  function init () {
    if (!window.lang) {
      alert('Error: The language object is not available!');
      return;
    }

    if (!window.PaintTools) {
      alert(lang.PaintToolsNotFound);
      return;
    }

    // This application does not yet implement layers support.
    // However, there's only little additional work to be done for layers 
    // support.
    _self.layer.id = 1;

    // Find the canvas element.
    _self.layer.canvas = document.getElementById('imageLayer');
    if (!_self.layer.canvas) {
      alert(lang.errorCanvasNotFound);
      return;
    }

    if (!_self.layer.canvas.getContext) {
      alert(lang.errorGetContext);
      return;
    }

    // Get the 2D canvas context.
    _self.layer.context = _self.layer.canvas.getContext('2d');
    if (!_self.layer.context) {
      alert(lang.errorGetContext);
      return;
    }

    // Add the buffer canvas.
    var container = _self.layer.canvas.parentNode;
    _self.buffer.canvas = document.createElement('canvas');
    if (!_self.buffer.canvas) {
      alert(lang.errorCanvasCreate);
      return;
    }

    _self.buffer.canvas.id     = 'imageBuffer';
    _self.buffer.canvas.width  = _self.layer.canvas.width;
    _self.buffer.canvas.height = _self.layer.canvas.height;
    container.appendChild(_self.buffer.canvas);

    _self.buffer.context = _self.buffer.canvas.getContext('2d');

    // Get the tools drop-down.
    var tool_select = document.getElementById('tool');
    if (!tool_select) {
      alert(lang.errorToolSelect);
      return;
    }
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (PaintTools[_self.tool_default]) {
      _self.tool = new PaintTools[_self.tool_default](_self);
      tool_select.value = _self.tool_default;
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    _self.buffer.canvas.addEventListener('mousedown', ev_canvas, false);
    _self.buffer.canvas.addEventListener('mousemove', ev_canvas, false);
    _self.buffer.canvas.addEventListener('mouseup',   ev_canvas, false);
  };

  /**
   * The Canvas event handler.
   * 
   * <p>This method determines the mouse position relative to the canvas 
   * element, after which it invokes the method of the currently active tool 
   * with the same name as the current event type. For example, for the 
   * <code>mousedown</code> event the <code><var>tool</var>.mousedown()</code> 
   * method is invoked.
   *
   * <p>The mouse coordinates are added to the <var>ev</var> DOM Event object: 
   * <var>ev.x_</var> and <var>ev.y_</var>.
   *
   * @private
   * @param {Event} ev The DOM Event object.
   */
  function ev_canvas (ev) {
    if (typeof ev.layerX != 'undefined') { // Firefox
      ev.x_ = ev.layerX;
      ev.y_ = ev.layerY;
    } else if (typeof ev.offsetX != 'undefined') { // Opera
      ev.x_ = ev.offsetX;
      ev.y_ = ev.offsetY;
    }

    // Call the event handler of the active tool.
    var func = _self.tool[ev.type];
    if (typeof func == 'function') {
      func(ev);
    }
  };

  /**
   * The event handler for any changes made to the tool selector.
   * @private
   */
  function ev_tool_change () {
    if (PaintTools[this.value]) {
      _self.tool = new PaintTools[this.value](_self);
    }
  };

  /**
   * This method draws the buffer canvas on top of the current image layer, 
   * after which the buffer is cleared. This function is called each time when 
   * the user completes a drawing operation.
   */
  this.layerUpdate = function () {
		_self.layer.context.drawImage(_self.buffer.canvas, 0, 0);
		_self.buffer.context.clearRect(0, 0, _self.buffer.canvas.width, _self.buffer.canvas.height);
  };

  init();
};

if(window.addEventListener) {
window.addEventListener('load', function () {
  if (window.Painter) {
    // Create a Painter object instance.
    window.PainterInstance = new Painter();
  }
}, false); }

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:
