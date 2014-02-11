window.addEventListener('load', function() {
  var section = document.querySelector('div.main'),
      args = document.querySelector('div.arguments'),
      controls = document.querySelector('.controls'),
      image = args.querySelector('img'),
      video = args.querySelector('video'),
      log = $('log'),
      useBloomX = true,
      useBloomY = true,
      useBlending = true;

  //check support
  if (!supportsWebGL()) {
    log.innerHTML = '<p class=\'error\'>Your browser doesn\'t seem to support WebGL. More info <a href=\'http://get.webgl.org/\'>here</a>.</p>';
    return;
  }

  //add events
  $('useBloomX').addEventListener('change', function() {
    useBloomX = this.checked;
  });
  $('useBloomY').addEventListener('change', function() {
    useBloomY = this.checked;
  });
  $('useBlending').addEventListener('change', function() {
    useBlending = this.checked;
  });

  //get context
  var canvas = $('webgl-canvas'),
      gl = getWebGLContext(canvas),
      useVideo;

  createProgramsFromURIs(gl, {
    programs: [{
      name: 'bloom',
      vsURI: 'shaders/simple.vs',
      fsURI: 'shaders/bloom.fs'
    }, {
      name: 'blend',
      vsURI: 'shaders/simple.vs',
      fsURI: 'shaders/blend.fs'
    }],
    onComplete: function(programs) {
      //try adding video input, if not fallback to image
      useVideo = setupCamera();
      if (!useVideo) {
        image.style.display = '';
        render(programs);
      } else {
        controls.style.display = '';
        video.addEventListener('loadeddata', render.bind(null, programs));
      }
    }
  });

  function setupCamera(callback) {
    var getUserMediaKey = ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia'],
        urlKey = ['URL', 'webkitURL', 'mozURL'],
        found = false,
        videoHandler  = function(localMediaStream) {
          video.style.display = '';
          video.src = window[urlKey[i]].createObjectURL(localMediaStream);
          video.play();
        },
        videoHandler2 = function(stream) {
          video.style.display = '';
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

  function render(programs) {
    var buffer = gl.createBuffer(),
        vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1],
        inputTexture = createTexture(gl, useVideo ? video : image),
        bloomXFramebuffer = createFramebuffer(gl, useVideo ? video : image),
        bloomYFramebuffer = createFramebuffer(gl, useVideo ? video : image),
        x, y;

    //set position attribute data
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    //set image as texture and render only once
    if (!useVideo) {
      log.innerHTML = 'Your browser doesn\'t seem to support getUserMedia, using HTMLImage.';
      section.style.width = image.offsetWidth + 'px';
      section.style.height = image.offsetHeight + 'px';
      postProcess({
        gl: gl,
        programs: programs,
        quad: buffer,
        input: image,
        inputTexture: inputTexture,
        bloomXFramebuffer: bloomXFramebuffer,
        bloomYFramebuffer: bloomYFramebuffer
      });
      return;
    }

    window.requestAnimationFrame(function loop() {
      canvas.width = video.offsetWidth;
      canvas.height = video.offsetHeight;
      section.style.width = canvas.width + 'px';
      section.style.height = canvas.height + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);

      postProcess({
        gl: gl,
        programs: programs,
        quad: buffer,
        input: video,
        inputTexture: inputTexture,
        bloomXFramebuffer: bloomXFramebuffer,
        bloomYFramebuffer: bloomYFramebuffer
      });
      //request next frame to render
      window.requestAnimationFrame(loop);
    });
  }

  function postProcess(opt) {
    var gl = opt.gl,
        programs = opt.programs,
        quad = opt.quad,
        input = opt.input,
        inputTexture = opt.inputTexture,
        bloomXFramebuffer = opt.bloomXFramebuffer,
        bloomYFramebuffer = opt.bloomYFramebuffer,
        canvas = gl.canvas,
        widthLocation,
        heightLocation,
        samplerLocation,
        samplerLocation0,
        samplerLocation1,
        positionLocation,
        useBlendingLocation,
        currentProgram;

    //1.- first pass
    currentProgram = programs.bloom,
    gl.bindFramebuffer(gl.FRAMEBUFFER, bloomXFramebuffer.buffer);
    gl.useProgram(currentProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);

    //set uniform data
    widthLocation = gl.getUniformLocation(currentProgram, 'width');
    heightLocation = gl.getUniformLocation(currentProgram, 'height');
    blurXLocation = gl.getUniformLocation(currentProgram, 'blurX');
    blurYLocation = gl.getUniformLocation(currentProgram, 'blurY');
    samplerLocation = gl.getUniformLocation(currentProgram, 'sampler0');
    positionLocation = gl.getAttribLocation(currentProgram, 'position');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(widthLocation, canvas.width);
    gl.uniform1f(heightLocation, canvas.height);
    gl.uniform1f(blurXLocation, useBloomX ? 1 : 0);
    gl.uniform1f(blurYLocation, 0);
    gl.uniform1i(samplerLocation, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //send result to bloomX framebuffer
    gl.bindTexture(gl.TEXTURE_2D, bloomXFramebuffer.texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //2.- second pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, bloomYFramebuffer.buffer);

    gl.uniform1f(blurXLocation, 0);
    gl.uniform1f(blurYLocation, useBloomY ? 1 : 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bloomXFramebuffer.texture);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //send result to bloomY framebuffer
    gl.bindTexture(gl.TEXTURE_2D, bloomYFramebuffer.texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //3.- blend texture with current output, add tone mapping and send to screen
    currentProgram = programs.blend;
    gl.useProgram(currentProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);

    //set uniform data
    widthLocation = gl.getUniformLocation(currentProgram, 'width');
    heightLocation = gl.getUniformLocation(currentProgram, 'height');
    samplerLocation0 = gl.getUniformLocation(currentProgram, 'sampler0');
    samplerLocation1 = gl.getUniformLocation(currentProgram, 'sampler1');
    useBlendingLocation = gl.getUniformLocation(currentProgram, 'useBlending');
    positionLocation = gl.getAttribLocation(currentProgram, 'position');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(widthLocation, canvas.width);
    gl.uniform1f(heightLocation, canvas.height);
    gl.uniform1i(samplerLocation0, 0);
    gl.uniform1i(samplerLocation1, 1);
    gl.uniform1i(useBlendingLocation, useBlending ? 1 : 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bloomYFramebuffer.texture);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function createTexture(gl, size) {
    var texture = gl.createTexture();
    //set properties for the texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.offsetWidth, size.offsetHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    return texture;
  }

  function createFramebuffer(gl, size) {
    var buffer = gl.createFramebuffer();
    //bind framebuffer to texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
    var texture = createTexture(gl, size);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    return {
      texture: texture,
      buffer: buffer
    };
  }
});

