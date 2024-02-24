uniform float uTime;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec2 vUv;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float randomStep(vec2 st)
{
    return step(0.999,fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123));
}



void main(){
    float strength = 1.-step(0.01, -1.*random(vUv)*(0.1)+abs(((vUv.x+sin(vUv.y*75.+(uTime*vElevation*0.1))*0.35)-0.5)*((vUv.x+sin((vUv.y+(uTime*vElevation*0.1))*75.)*0.35)-0.5) + ((vUv.y+sin(vUv.x*75.+(uTime*vElevation*0.1))*0.35)-0.5)*((vUv.y+sin(vUv.x*75.+(uTime*vElevation*0.1))*0.35)-0.5)-0.15));

    float mixStrength = (vElevation + uColorOffset)*uColorMultiplier;

    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);


    gl_FragColor = vec4(color, 1.0);
}