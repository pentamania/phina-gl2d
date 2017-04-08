
/**
 * プール
 */
phina.define('ObjectPool', {
  superClass: "phina.util.EventDispatcher",

  init: function() {
    this.superInit();
    this.objects = [];
    this._pointer = 0;
  },

  add: function(obj) {
    obj.isReady = true;
    this.objects.push(obj);
  },

  pick: function(cb) {
    var obj = null;
    this.objects.some(function(o){
      if (o.isReady) {
        o.isReady = false;
        obj = o;
        return true;
      }
    });

    if (obj && cb) cb(obj);
  },

  // いる？
  // recover: function(obj) {
  //   obj.isReady = true;
  // }

});

/**
 * ゲームオブジェクトの抽象クラス
 * ageの加算、 remove時の動作追加
 */
phina.define('AbstractObjClass', {
  superClass: "phina.display.Sprite",

  init: function(image, width, height) {
    this.superInit(image, width, height);
    this.setBoundingType('circle');
    this.targetLayer = null;
    this.isReady = true;
    this.age = 0;

    this.on('removed', function(){
      this.isReady = true;
    });

    this.on('enterframe', function(){
      this.age++;
    })
  },

  isOutOfScreen: function() {
    return (
      this.x < -10 ||
      SCREEN_WIDTH+10 < this.x ||
      this.y < -10 ||
      SCREEN_HEIGHT+10 < this.y
    );
  },

});