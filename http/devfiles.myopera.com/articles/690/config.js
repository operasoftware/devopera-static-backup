/*
 * © 2009 ROBO Design
 * http://www.robodesign.ro
 *
 * $Date: 2009-04-19 17:24:26 +0300 $
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
   * Keyboard shortcuts associated to drawing tools.
   *
   * @type Object
   * @see PaintTools The object holding all the drawing tools.
   */
  keys: {
    L: { tool: 'line' },
    P: { tool: 'pencil' },
    R: { tool: 'rect' }
  }
};


// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:
