/**
 * Camera
 */
phina.namespace(function() {

  phina.define("phina.gl2d.Camera", {

    position: null,
    vMatrix: null,
    pMatrix: null,
    vpMatrix: null,

    init: function() {
      var m4 = this._m4 = phina.geom.MatIV();
      this.position = new Array(3);
      this.vMatrix = m4.create();
      this.pMatrix = m4.create();
      this.vpMatrix = m4.create();
    },

    setPosition: function(x, y, z) {
      // vec3.set(this.position, x, y, z);
      this.position[0] = x;
      this.position[1] = y;
      this.position[2] = z;
      return this;
    },

    lookAt: function(x, y, z) {
      this._m4.lookAt(this.position, [x, y, z], [0, 1, 0], this.vMatrix);
      return this;
    },

    ortho: function(left, right, top, bottom, near, far) {
      this._m4.ortho(left, right, top, bottom, near, far, this.pMatrix);
      return this;
    },

    calcVpMatrix: function() {
      // mat4.multiply(this.vpMatrix, this.pMatrix, this.vMatrix);
      this._m4.multiply(this.pMatrix, this.vMatrix, this.vpMatrix)
      return this;
    },

    uniformValues: function() {
      return {
        vpMatrix: this.vpMatrix,
        cameraPosition: this.position,
      };
    }

  });
});
