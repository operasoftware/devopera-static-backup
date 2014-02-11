window.addEventListener('load', function() {
  var section = document.querySelector('div.main'),
      args = document.querySelector('div.arguments'),
      image = args.querySelector('img'),
      video = args.querySelector('video'),
      log = $('log');

  //check support
  if (!supportsWebGL()) {
    log.innerHTML = '<p class=\'error\'>Your browser doesn\'t seem to support WebGL. More info <a href=\'http://get.webgl.org/\'>here</a>.</p>';
    return;
  }

  //get context
  var canvas = $('webgl-canvas'),
      gl = getWebGLContext(canvas);

  //try adding video input, if not fallback to image
  var useVideo = setupCamera();

  //create a program
  createProgramFromURIs(gl, {
    vsURI: 'shaders/simple.vs',
    fsURI: 'shaders/sobel.fs',
    onComplete: function(program) {
      render(program);
    }
  });

  function setupCamera(callback) {
    var getUserMediaKey = ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia'],
        urlKey = ['URL', 'webkitURL', 'mozURL'],
        found = false,
        videoHandler  = function(localMediaStream) {
          video.src = window[urlKey[i]].createObjectURL(localMediaStream);
          video.play();
        },
        videoHandler2 = function(stream) {
          video.src = stream;
          video.play();
        },
        errorHandler  = function() {
          log.innerHTML = 'An error occurred while loading the camera. Please refresh and try again.';
        },
        key;

    for (var i = 0, l = getUserMediaKey.length; i < l; ++i) {
      key = getUserMediaKey[i];
      if (key in navigator) {
        if (i > 0) {
          navigator[key]({ video: true }, videoHandler,  errorHandler);
        } else {
          navigator[key]({ video: true }, videoHandler2, errorHandler);
        }
        found = true;
        break;
      }
    }

    return found;
  }

  function render(program) {
    gl.useProgram(program);

    var widthLocation = gl.getUniformLocation(program, 'width'),
        heightLocation = gl.getUniformLocation(program, 'height'),
        samplerLocation = gl.getUniformLocation(program, 'sampler0'),
        positionLocation = gl.getAttribLocation(program, 'position'),
        buffer = gl.createBuffer(),
        vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1],
        texture = gl.createTexture();

    //set uniform size data
    gl.uniform1f(widthLocation, canvas.width);
    gl.uniform1f(heightLocation, canvas.height);

    //set texture sampler
    gl.uniform1i(samplerLocation, 0);
    //set position attribute data
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    //set properties for the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);

    //set image as texture and render only once
    if (!useVideo) {
      log.innerHTML = 'Your browser doesn\'t seem to support getUserMedia, using HTMLImage.';
      image.style.display = '';
      section.style.width = image.offsetWidth + 'px';
      section.style.height = image.offsetHeight + 'px';
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return;
    }
    video.style.display = '';

    window.requestAnimationFrame(function loop() {
      //set uniform size data
      canvas.width = video.offsetWidth;
      canvas.height = video.offsetHeight;
      section.style.width = canvas.width + 'px';
      section.style.height = canvas.height + 'px';
      gl.uniform1f(widthLocation, canvas.width);
      gl.uniform1f(heightLocation, canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      //draw rectangle
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindTexture(gl.TEXTURE_2D, null);
      //request next frame to render
      window.requestAnimationFrame(loop);
    });
  }

});
