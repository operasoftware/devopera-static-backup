/*
 * © 2009 ROBO Design
 * http://www.robodesign.ro
 *
 * $Date: 2009-04-21 14:57:31 +0300 $
 */

/**
 * @author <a lang="ro" href="http://www.robodesign.ro/mihai">Mihai Şucan</a>
 * @fileOverview Configuration file for the web application.
 */

/**
 * @namespace Holds all the configuration for the paint application.
 */
var PainterConfig = {
  /**
   * The default tool ID.
   *
   * @type String
   * @see PaintTools The object holding all the drawing tools.
   */
  tool_default: 'line',

  /**
   * The mouse keys movement acceleration.
   *
   * @type Number
   * @see PaintMouseKeys The MouseKeys extension.
   */
  mousekeys_accel: 0.1,

  /**
   * Keyboard shortcuts associated to drawing tools and other actions.
   *
   * @type Object
   * @see PaintTools The object holding all the drawing tools.
   */
  keys: {
    0: { action: 'mousekeys', param: 'Toggle' },
    1: { action: 'mousekeys', param: 'SouthWest' },
    2: { action: 'mousekeys', param: 'South' },
    3: { action: 'mousekeys', param: 'SouthEast' },
    4: { action: 'mousekeys', param: 'West' },
    6: { action: 'mousekeys', param: 'East' },
    7: { action: 'mousekeys', param: 'NorthWest' },
    8: { action: 'mousekeys', param: 'North' },
    9: { action: 'mousekeys', param: 'NorthEast' },
    L: { tool: 'line' },
    P: { tool: 'pencil' },
    R: { tool: 'rect' }
  }
};

// Make sure the number keys on the NumPad also work when the Shift key is down.
lib.extend(PainterConfig.keys, {
  'Shift Insert':   PainterConfig.keys['0'],
  'Shift End':      PainterConfig.keys['1'],
  'Shift Down':     PainterConfig.keys['2'],
  'Shift PageDown': PainterConfig.keys['3'],
  'Shift Left':     PainterConfig.keys['4'],
  'Shift Right':    PainterConfig.keys['6'],
  'Shift Home':     PainterConfig.keys['7'],
  'Shift Up':       PainterConfig.keys['8'],
  'Shift PageUp':   PainterConfig.keys['9']
});


// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:
