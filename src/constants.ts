
// Don't re-order
export const ATTRIBUTES = [
  {
    name: "position",
    type: "FLOAT_VEC2",
  },
  {
    name: "uv",
    type: "FLOAT_VEC2",
    // type: gl.UNSIGNED_SHORT,
    // normalize: true,
  },
  {
    name: "color",
    type: "FLOAT_VEC4",
  },
];

export const UNIFORMS = [
  {
    name: 'vpMatrix',
    type: 'FLOAT_MAT4',
  },
  {
    name: 'texture',
    type: 'SAMPLER_2D',
    value: 0,
  }
]

export const DEFAULT_VERTEX_SHADER_SOURCE = [
  "precision highp float;", // 一部のGPU向け？

  "attribute vec2 position;",
  "attribute vec2 uv;",
  "attribute vec4 color;",

  "uniform mat4 vpMatrix;",

  "varying vec2 vUv;",
  "varying vec4 vColor;",

  "void main(void) {",
  "  gl_Position = vpMatrix * vec4(position, 0.0, 1.0);",

  "  vUv = uv;",
  "  vColor = vec4(color.rgb * color.a, color.a);",
  "}",
].join("\n");

export const DEFAULT_FRAGMENT_SHADER_SOURCE = [
  "precision mediump float;",
  "uniform sampler2D texture;",

  "varying vec2 vUv;",
  "varying vec4 vColor;",

  "void main(void) {",
  "  gl_FragColor = texture2D(texture, vUv) * vColor;",
  "}",
].join("\n")
