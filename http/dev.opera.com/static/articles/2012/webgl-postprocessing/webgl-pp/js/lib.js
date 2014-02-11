//get an element by id
function $(d) {
  return document.getElementById(d);
}

//Feature test WebGL
var supportsWebGL;
(function() {
  try {
    var canvas = document.createElement('canvas');
    supportsWebGL = function() {
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    };
  } catch(e) {
    supportsWebGL = function() {
        return false;
    };
  }
})();

//returns a context for the webgl api or null
function getWebGLContext(canvas) {
  return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
}

//return a webgl shader instance from a shader source string
function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  if (shader == null) {
    console.error('Error creating the shader with shader type: ' + type);
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    console.error('Error while compiling the shader ' + info);
  }
  return shader;
}

//create a webgl shader instance from a given uri
function createShaderFromURI(gl, type, uri, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', uri, true);
  xhr.onreadystatechange = function(e) {
    //completed
    if (xhr.readyState == 4) {
      //OK
      if (xhr.status == 200) {
        callback(createShader(gl, type, xhr.responseText));
      } else {
        console.error('There was an error in the page load');
        callback(null);
      }
    }
  };
  xhr.send(null);
}

//create a WebGLProgram instance from two WebGLShaders.
function createProgramFromShaders(gl, vs, fs) {
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    //link program
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      console.error('Error linking the shader: ' + gl.getProgramInfoLog(program));
    }
    return program;
}

//Create program from URIs
function createProgramFromURIs(gl, options) {
  var vsURI = options.vsURI,
      fsURI = options.fsURI,
      onComplete = options.onComplete;

  createShaderFromURI(gl, gl.VERTEX_SHADER, vsURI, function(vsShader) {
    createShaderFromURI(gl, gl.FRAGMENT_SHADER, fsURI, function(fsShader) {
      onComplete(createProgramFromShaders(gl, vsShader, fsShader));
    });
  });
}

//Create various programs simultaneously form given URIs
function createProgramsFromURIs(gl, options) {
  var len = options.programs.length,
      programs = {},
      callback = function(name, program) {
        len--;
        programs[name] = program;
        if (len <= 0) {
          options.onComplete(programs);
        }
      };

  options.programs.forEach(function (opt) {
    createProgramFromURIs(gl, {
      vsURI: opt.vsURI,
      fsURI: opt.fsURI,
      onComplete: function(program) {
        callback(opt.name, program);
      }
    });
  });
}

//polyfill for raq
(function() {
  if (window.requestAnimationFrame) return;

  var found = false;
  ['oRequestAnimationFrame',
   'webkitRequestAnimationFrame',
   'mozRequestAnimationFrame'].forEach(function(impl) {

    if (impl in window) {
      window.requestAnimationFrame = function(callback) {
        window[impl](function() {
          callback();
        });
      };
      found = true;
    }
  });
  if (!found) {
    window.requestAnimationFrame = function(callback) {
      setTimeout(function() {
        callback();
      }, 1000 / 60);
    };
  }
})();
