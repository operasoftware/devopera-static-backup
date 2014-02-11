window.addEventListener('DOMContentLoaded', function() {
  //check support
  if (!supportsWebGL()) {
    $('log').innerHTML = '<p class=\'error\'>Your browser doesn\'t seem to support WebGL. More info <a href=\'http://get.webgl.org/\'>here</a>.</p>';
    return;
  }

  //get context
  var canvas = $('webgl-canvas'),
      gl = getWebGLContext(canvas);

  //create a program
  createProgramFromURIs(gl, {
    vsURI: 'shaders/simple.vs',
    fsURI: 'shaders/simple.fs',
    onComplete: function(program) {
      render(program);
    }
  });

  function render(program) {
    gl.useProgram(program);

    var sizeLocation = gl.getUniformLocation(program, 'size'),
        positionLocation = gl.getAttribLocation(program, 'position'),
        buffer = gl.createBuffer(),
        vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

    //set uniform size data
    gl.uniform1f(sizeLocation, canvas.width);

    //set position attribute data
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    //draw rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
});
