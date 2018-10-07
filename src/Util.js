phina.namespace(function() {

  /*!
  * Used for reference
  * minMatrix.js (c) doxas
  * https://wgld.org/d/library/
  */
  var ARRAY = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
  var createMatrix44 = function() {
    var dest = new ARRAY(16);
    dest[0]  = 1; dest[1]  = 0; dest[2]  = 0; dest[3]  = 0;
    dest[4]  = 0; dest[5]  = 1; dest[6]  = 0; dest[7]  = 0;
    dest[8]  = 0; dest[9]  = 0; dest[10] = 1; dest[11] = 0;
    dest[12] = 0; dest[13] = 0; dest[14] = 0; dest[15] = 1;
    return dest;
  }
  var lookAt = function(eye, center, up, dest) {
    dest = dest || createMatrix44();
    var eyeX = eye[0],
        eyeY = eye[1],
        eyeZ = eye[2],
        upX = up[0],
        upY = up[1],
        upZ = up[2],
        centerX = center[0],
        centerY = center[1],
        centerZ = center[2];
    if (eyeX == centerX && eyeY == centerY && eyeZ == centerZ) {
      // return this.identity(dest);
      return createMatrix44();
    }

    var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
    z0 = eyeX - center[0];
    z1 = eyeY - center[1];
    z2 = eyeZ - center[2];
    l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= l;
    z1 *= l;
    z2 *= l;
    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;
    l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!l) {
      x0 = 0; x1 = 0; x2 = 0;
    } else {
      l = 1 / l;
      x0 *= l; x1 *= l; x2 *= l;
    }
    y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0;
    l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!l) {
      y0 = 0; y1 = 0; y2 = 0;
    } else {
      l = 1 / l;
      y0 *= l; y1 *= l; y2 *= l;
    }
    dest[0] = x0; dest[1] = y0; dest[2]  = z0; dest[3]  = 0;
    dest[4] = x1; dest[5] = y1; dest[6]  = z1; dest[7]  = 0;
    dest[8] = x2; dest[9] = y2; dest[10] = z2; dest[11] = 0;
    dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
    dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
    dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
    dest[15] = 1;
    return dest;
  };

  var ortho = function(left, right, top, bottom, near, far, dest) {
    dest = dest || createMatrix44();
    var h = (right - left);
    var v = (top - bottom);
    var d = (far - near);
    dest[0]  = 2 / h;
    dest[1]  = 0;
    dest[2]  = 0;
    dest[3]  = 0;
    dest[4]  = 0;
    dest[5]  = 2 / v;
    dest[6]  = 0;
    dest[7]  = 0;
    dest[8]  = 0;
    dest[9]  = 0;
    dest[10] = -2 / d;
    dest[11] = 0;
    dest[12] = -(left + right) / h;
    dest[13] = -(top + bottom) / v;
    dest[14] = -(far + near) / d;
    dest[15] = 1;
    return dest;
  };

  var multiply = function(mat1, mat2, dest) {
    dest = dest || createMatrix44();
    var a = mat1[0],  b = mat1[1],  c = mat1[2],  d = mat1[3],
        e = mat1[4],  f = mat1[5],  g = mat1[6],  h = mat1[7],
        i = mat1[8],  j = mat1[9],  k = mat1[10], l = mat1[11],
        m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
        A = mat2[0],  B = mat2[1],  C = mat2[2],  D = mat2[3],
        E = mat2[4],  F = mat2[5],  G = mat2[6],  H = mat2[7],
        I = mat2[8],  J = mat2[9],  K = mat2[10], L = mat2[11],
        M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
    dest[0] = A * a + B * e + C * i + D * m;
    dest[1] = A * b + B * f + C * j + D * n;
    dest[2] = A * c + B * g + C * k + D * o;
    dest[3] = A * d + B * h + C * l + D * p;
    dest[4] = E * a + F * e + G * i + H * m;
    dest[5] = E * b + F * f + G * j + H * n;
    dest[6] = E * c + F * g + G * k + H * o;
    dest[7] = E * d + F * h + G * l + H * p;
    dest[8] = I * a + J * e + K * i + L * m;
    dest[9] = I * b + J * f + K * j + L * n;
    dest[10] = I * c + J * g + K * k + L * o;
    dest[11] = I * d + J * h + K * l + L * p;
    dest[12] = M * a + N * e + O * i + P * m;
    dest[13] = M * b + N * f + O * j + P * n;
    dest[14] = M * c + N * g + O * k + P * o;
    dest[15] = M * d + N * h + O * l + P * p;
    return dest;
  }

  phina.define("phina.gl2d.Util", {
    _static: {
      getVPMatrix: function(width, height) {
        var vMatrix, pMatrix;
        var wh = width * 0.5,
            hh = height * 0.5;

        // lookAt
        var eye = [wh, hh, 1];
        var target = [wh, hh, 0];
        var up = [0, 1, 0];
        vMatrix = lookAt(eye, target, up);

        // perspective
        var left = - wh,
            right = wh,
            top = -hh,
            bottom = hh,
            near = 0,
            far = 1;
        pMatrix = ortho(left, right, top, bottom, near, far);

        // return vpMatrix
        return multiply(pMatrix, vMatrix);
      }
    }
  });

});