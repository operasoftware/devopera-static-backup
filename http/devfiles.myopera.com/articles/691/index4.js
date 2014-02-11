/*
 * © 2009 ROBO Design
 * http://www.robodesign.ro
 *
 * $Date: 2009-04-28 19:38:57 +0300 $
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
   * @see PainterConfig.tool_default holds the ID of the tool which is activated 
   * when the application loads.
   */
  this.tool = null;

  /**
   * Holds references to important DOM elements.
   *
   * @private
   * @type Object
   */
  this.elems = {};

  /**
   * Holds the last recorded mouse coordinates and the button state (if it's 
   * down or not).
   *
   * @private
   * @type Object
   */
  this.mouse = {x: 0, y: 0, buttonDown: false};

  /**
   * Holds all the removable functionality from the paint application.
   *
   * @type Object
   * @see Painter#actionAdd Add a new action.
   * @see Painter#actionRemove Remove an action.
   */
  this.actions = {};

  /**
   * Holds the keyboard event listener object.
   *
   * @private
   * @type lib.dom.KeyboardEventListener
   * @see lib.dom.KeyboardEventListener The class dealing with the cross-browser 
   * differences in the DOM keyboard events.
   */
  var kbListener_;

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

    if (!window.PainterConfig) {
      alert(lang.PainterConfigNotFound);
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
    _self.elems.tool_select = document.getElementById('tool');
    if (!_self.elems.tool_select) {
      alert(lang.errorToolSelect);
      return;
    }
    _self.elems.tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    _self.toolActivate(PainterConfig.tool_default);

    // Attach the mousedown, mousemove and mouseup event listeners.
    _self.buffer.canvas.addEventListener('mousedown', ev_canvas, false);
    _self.buffer.canvas.addEventListener('mousemove', ev_canvas, false);
    _self.buffer.canvas.addEventListener('mouseup',   ev_canvas, false);

    // Add the keyboard events handler.
    kbListener_ = new lib.dom.KeyboardEventListener(window,
        {keydown: ev_keyhandler, keypress: ev_keyhandler, keyup: ev_keyhandler});
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
   *
   * @param {Event} ev The DOM Event object.
   *
   * @returns The result returned by the event handler of the current tool. If 
   * no event handler was executed, false is returned.
   */
  function ev_canvas (ev) {
    if (!ev.type || !_self.tool) {
      return false;
    }

    /*
     * If the mouse is down already, skip the event.
     * This is needed to allow the user to go out of the drawing canvas, release 
     * the mouse button, then come back and click to end the drawing operation.
     * Additionally, this is needed to allow extensions like MouseKeys to 
     * perform their actions during a drawing operation, even when a real mouse 
     * is used. For example, allow the user to start drawing with the keyboard 
     * (press 0) then use the real mouse to move and click to end the drawing 
     * operation.
     */
    if (_self.mouse.buttonDown && ev.type == 'mousedown') {
      return false;
    }

    // Don't overwrite any existing x_ / y_ property.
    // These properties might be added by other functions.
    if (typeof ev.x_ == 'undefined') {
      if (typeof ev.layerX != 'undefined') { // Firefox
        ev.x_ = ev.layerX;
        ev.y_ = ev.layerY;
      } else if (typeof ev.offsetX != 'undefined') { // Opera
        ev.x_ = ev.offsetX;
        ev.y_ = ev.offsetY;
      }

      // Update the current mouse position only for mouse events.
      // Other events do not provide accurate mouse coordinates.
      switch (ev.type) {
        case 'mousedown':
        case 'mousemove':
        case 'mouseup':
          _self.mouse.x = ev.x_;
          _self.mouse.y = ev.y_;
      }
    }

    if (ev.type == 'mousedown') {
      _self.mouse.buttonDown = true;
    }

    // Call the event handler of the active tool.
    var func = _self.tool[ev.type];
    if (typeof func != 'function') {
      return false;
    }

    res = func(ev);

    if (ev.type == 'mouseup') {
      _self.mouse.buttonDown = false;
    }

    /*
     * If the event handler from the current tool does return false, it means it 
     * did not execute for some reason. For example, in a keydown event handler 
     * the keyboard shortcut does not match some criteria, thus the handler 
     * returns false, leaving the event continue its normal flow.
     */
    if (res !== false && ev.preventDefault) {
      ev.preventDefault();
    }

    return res;
  };

  /**
   * The event handler for any changes made to the tool selector.
   *
   * @private
   * @see Painter#toolActivate The method which does the actual drawing tool 
   * activation.
   */
  function ev_tool_change () {
    _self.toolActivate(this.value);
  };

  /**
   * Activate a drawing tool by ID.
   *
   * <p>The <var>id</var> provided must be available in the global {@link 
   * PaintTools} object.
   *
   * @param {String} id The ID of the drawing tool to be activated.
   *
   * @returns {Boolean} True if the tool has been activated, or false if not.
   *
   * @see PaintTools The object holding all the drawing tools.
   */
  this.toolActivate = function (id) {
    if (!id) {
      return false;
    }

    // Find the tool object.
    var tool = PaintTools[id];
    if (!tool) {
      return false;
    }

    // Check if the current tool is the same as the desired one.
    if (_self.tool && _self.tool instanceof tool) {
      return true;
    }

    // Construct the new tool object.
    var tool_obj = new tool(_self);
    if (!tool_obj) {
      alert(lang.errorToolActivate);
      return false;
    }

    _self.tool = tool_obj;

    // Update the tool drop-down.
    _self.elems.tool_select.value = id;

    return true;
  };

  /**
   * The global keyboard events handler. This makes all the keyboard shortcuts 
   * work in the web application.
   *
   * <p>This method determines the key the user pressed, based on the 
   * <var>ev</var> DOM Event object, taking into consideration any browser 
   * differences. Two new properties are added to the <var>ev</var> object:
   *
   * <ul>
   *   <li><var>ev.kid_</var> is a string holding the key and the modifiers list 
   *   (<kbd>Control</kbd>, <kbd>Alt</kbd> and/or <kbd>Shift</kbd>). For 
   *   example, if the user would press the key <kbd>A</kbd> while holding down 
   *   <kbd>Control</kbd>, then <var>ev.kid_</var> would be "Control A". If the 
   *   user would press "9" while holding down <kbd>Shift</kbd>, then 
   *   <var>ev.kid_</var> would be "Shift 9".
   *
   *   <li><var>ev.kobj_</var> holds a reference to the keyboard shortcut 
   *   definition object from the configuration. This is useful for reuse, for 
   *   passing parameters from the keyboard shortcut configuration object to the 
   *   event handler.
   * </ul>
   *
   * <p>In {@link PainterConfig.keys} one can setup the keyboard shortcuts. If 
   * the keyboard combination is found in that list, then the associated tool is 
   * activated.
   *
   * @private
   *
   * @param {Event} ev The DOM Event object.
   *
   * @see PainterConfig.keys The keyboard shortcuts configuration.
   * @see lib.dom.KeyboardEventListener The class dealing with the cross-browser 
   * differences in the DOM keyboard events.
   */
  function ev_keyhandler (ev) {
    if (!ev || !ev.key_) {
      return;
    }

    // Do not continue if the event target is some form input.
    if (ev.target && ev.target.nodeName) {
      switch (ev.target.nodeName.toLowerCase()) {
        case 'input':
        case 'select':
          return;
      }
    }

    // Determine the key ID.
    ev.kid_ = '';
    var i, kmods = {altKey: 'Alt', ctrlKey: 'Control', shiftKey: 'Shift'};
    for (i in kmods) {
      if (ev[i] && ev.key_ != kmods[i]) {
        ev.kid_ += kmods[i] + ' ';
      }
    }
    ev.kid_ += ev.key_;

    /*
     * Send the event to the canvas, and eventually to the keydown event handler 
     * of the currently active tool (if any).
     * The effect of calling ev_canvas() is that the event object *might* have 
     * the x_ and y_ coordinate properties added. Additionally, if ev_canvas() 
     * returns some result, we can use it to cancel any global keyboard 
     * shortcut.
     */
    var canvas_result = ev_canvas(ev);
    if (canvas_result) {
      return;
    }

    // If there's no event handler within the active tool, or if the event 
    // handler does otherwise return false, then continue with the global 
    // keyboard shortcuts.

    var gkey = PainterConfig.keys[ev.kid_];
    if (!gkey) {
      return;
    }

    ev.kobj_ = gkey;

    // Execute the associated action.
    if (gkey.action) {
      var action = _self.actions[gkey.action];
      if (action) {
        var func = action[ev.type];
        if (typeof func == 'function') {
          func(ev);
        }
      }
    }

    // Activate the tool associated with the current keyboard shortcut.
    // Do this only once, for the keydown event.
    if (ev.type == 'keydown' && gkey.tool) {
      _self.toolActivate(gkey.tool);
    }

    if (ev.type == 'keypress' && ev.preventDefault) {
      ev.preventDefault();
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

  /**
   * Add a new action to the paint tool.
   *
   * @param {String} id The ID of the new action.
   * @param {Function} func The constructor function of the new action object.
   * @param {Boolean} [overwrite=false] Tells to overwrite or not an existing 
   * action, with the same ID.
   *
   * @returns {Boolean} True if the action was successfully added, or false if 
   * not.
   *
   * @see Painter#actionRemove allows you to remove actions.
   * @see Painter#actions Holds the action objects.
   */
  this.actionAdd = function (id, func, overwrite) {
    if (typeof id != 'string' || typeof func != 'function' || (this.actions[id] && !overwrite)) {
      return false;
    }

    this.actions[id] = new func(_self);

    return this.actions[id] ? true : false;
  };


  /**
   * Remove an action from the paint tool.
   *
   * <p>If the action object being destructed has the 
   * <code>actionRemove()</code> method, then it will be invoked, allowing any 
   * custom action removal code to run.
   *
   * @param {String} id The ID of the action object you want to remove.
   *
   * @returns {Boolean} True if the action was removed, or false if it does not 
   * exist or some error occurred.
   *
   * @see Painter#actionAdd allows you to add new actions.
   * @see Painter#actions Holds the action objects.
   */
  this.actionRemove = function (id) {
    if (!id || !_self.actions[id]) {
      return false;
    }

    if (typeof _self.actions[id].actionRemove == 'function') {
      _self.actions[id].actionRemove();
    }

    delete _self.actions[id];

    return true;
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
