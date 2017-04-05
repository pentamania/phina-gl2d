phina.namespace(function() {

  /**
   * @class phina.gl2d.GLContext
   * context管理用
   */
  phina.define("phina.gl2d.GLContext", {
    _static: {
      _view: null,
      _context: null,

      getView: function() {
        if (!this._view) this._view = document.createElement("canvas");
        return this._view;
      },

      getContext: function() {
        if (!this._view) this._view = document.createElement("canvas");
        if (!this._context) this._context = this._view.getContext("webgl") || this._view.getContext("experimental-webgl");
        return this._context;
      },
    }

  });

});
