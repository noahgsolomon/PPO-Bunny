uniform float uTime;

varying vec3 vColor;

void main() {

    float strength = 1.-((gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5));

    strength = strength*strength*strength*strength*strength*strength*strength*strength*strength*strength;

    gl_FragColor = vec4(vColor, strength);
}