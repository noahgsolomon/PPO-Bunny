attribute float aScale;
uniform float uSize;
uniform float uTime;

attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    float angle = atan(modelPosition.x, modelPosition.z);

    float distanceToCenter = length(modelPosition.xz);

    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;

    angle += angleOffset;

    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) *  distanceToCenter;

    modelPosition.x += aRandomness.x;
    modelPosition.y += aRandomness.y;
    modelPosition.z += aRandomness.z;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= ( 1. / - viewPosition.z);

    vColor = color;
}