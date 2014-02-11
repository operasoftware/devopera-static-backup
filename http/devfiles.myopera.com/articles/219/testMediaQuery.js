/*
* Copyright (c) 2007, Opera Software ASA
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of Opera Software ASA nor the
*       names of its contributors may be used to endorse or promote products
*       derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY OPERA SOFTWARE ASA ``AS IS'' AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL OPERA SOFTWARE ASA BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Execute a media query to determine what the browser supports
 *
 * <p>This function will attempt to execute a 
 * <a href="http://www.w3.org/TR/css3-mediaqueries/">CSS3 Media Query</a>
 * to determine if the browser supports the given media types or media features.
 * This is essentially the same as specifying a style sheet
 * rule using media queries, only in JavaScript instead.</p>
 * 
 * <p>Example usage:</p>
 * <pre><code>if (testMediaQuery("handheld")) { ... }</code></pre>
 * <p>or</p>
 * <pre><code>if (testMediaQuery("tv and (max-height: 400px)") { ... }</code></pre> *
 * @author Benjamin Joffe, benjoffe@opera.com
 * @param str media query to execute
 * @returns true if the browser satisfies the given media query, 
 *      otherwise false
 */
function testMediaQuery(str)
{
    var style = document.createElement('style');
    var div = document.createElement('div');
    var id = '';
    do {
        id = ('x'+Math.random()).replace(/\./,'');
    }
    while ( document.getElementById(id) );
    div.id = id;
    style.innerText = '@media ' + str + ' { #'+id+' { display:none !important; } }';
    document.documentElement.appendChild(style);
    document.documentElement.appendChild(div);
    var ret = getComputedStyle(div,null).getPropertyValue('display') == 'none';
    style.parentNode.removeChild(style);
    div.parentNode.removeChild(div);
    return ret;
}
