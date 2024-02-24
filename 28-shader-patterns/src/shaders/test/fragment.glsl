#define PI 3.1415926535897932384626433832795

varying vec2 vUv;
uniform float uTime;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}
void main()
{   
    // float barX = step(0.4,mod(vUv.x * 10.0 - 0.2, 1.0)) * step(0.8,mod(vUv.y * 10.0, 1.0));
    // float barY = step(0.8,mod(vUv.x * 10.0, 1.0)) * step(0.4,mod(vUv.y * 10.0 - 0.2, 1.0));
    // float strength = barX + barY;

    // float strength = cos(vUv.x*6.)+1.;
    // strength = abs(vUv.x-0.5);

    // float strength = min(abs(vUv.y-0.5), abs(vUv.x-0.5));

    // float strength = 1.;
    // if (vUv.x >= 0.35 && vUv.x <= 0.65 && vUv.y >= 0.35 && vUv.y <= 0.65) {
    //     strength = 0.;
    // }
    // // or
    // strength = step(0.2, max(abs(vUv.y-0.5), abs(vUv.x-0.5)));

    // float strength = random(vec2((floor(vUv.x*10.)/20.), floor((vUv.y+vUv.x)*10.)/20.));

    // float strength = sqrt((vUv.x)*(vUv.x) + (vUv.y)*(vUv.y));

    // vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5));

    // float strength = 0.15 / (distance(vec2(rotatedUv.x, (rotatedUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)));
    // strength *= 0.15 / (distance(vec2(rotatedUv.y, (rotatedUv.x - 0.5) * 5.0 + 0.5), vec2(0.5)));

    // float strength =  step(0.05, (vUv.x-0.5)*(vUv.x-0.5) + (vUv.y-0.5)*(vUv.y-0.5));
    
    // float strength = step(0.01, abs((vUv.x-0.5)*(vUv.x-0.5) + (vUv.y-0.5)*(vUv.y-0.5)-0.15));

    //super cool
    float strength = 1.-step(0.01, -1.*random(vUv)*(0.1)+abs(((vUv.x+sin(vUv.y*75.+(uTime*0.1))*0.35)-0.5)*((vUv.x+sin((vUv.y+(uTime*0.1))*75.)*0.35)-0.5) + ((vUv.y+sin(vUv.x*75.+(uTime*0.1))*0.35)-0.5)*((vUv.y+sin(vUv.x*75.+(uTime*0.1))*0.35)-0.5)-0.15));

    // float strength = vUv.x/vUv.y;
    // float strength = (vUv.x-0.5)/(vUv.y-0.5);

    // if (vUv.x <= 0.5){
    //     strength = 0.;
    // } else if (vUv.y <= 0.5){
    //     strength = 1.;
    // }

    // float strength = atan(vUv.x - 0.5, vUv.y - 0.5);
    // strength /= PI * 2.;
    // strength += 0.5;


    // float strength = atan(vUv.x - 0.5, vUv.y - 0.5);
    // strength /= PI * 2.;
    // strength += 0.5;
    // strength = mod(atan(vUv.x - 0.5, vUv.y - 0.5), 1./(PI))*PI;

    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.;
    // angle += 0.5;
    // angle = (sin(angle*100.));
    // float strength = 1.0-step(0.01, abs((vUv.x-(0.5))*(vUv.x-(0.5)) + (vUv.y-(0.5))*(vUv.y-(0.5))-(0.15+angle*0.01)));

    vec3 blackColor = vec3(0.0);

    vec3 uvColor = vec3(vUv, 1.);

    vec3 mixColor = mix(blackColor, uvColor, strength);

    gl_FragColor = vec4(vec3(strengths), 1.0);
}