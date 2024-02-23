// precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;
varying float vElevation;
varying vec2 vUv;

void main()
{
    vec4 textureColor = texture2D(uTexture, vUv);
    gl_FragColor = vec4(textureColor[0]+vElevation, textureColor[1]+vElevation, textureColor[2]+vElevation, textureColor[3]);
}
