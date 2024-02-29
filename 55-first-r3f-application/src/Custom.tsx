import React, { useEffect, useRef } from "react";
import { useMemo } from "react";
import { BufferGeometry, Mesh } from "three";

export default function Custom() {
  const verticesCount = 10 * 3;
  const geometryRef = useRef<BufferGeometry>(null);

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.computeVertexNormals();
    }
  }, []);

  const positions = useMemo(() => {
    const positions = new Float32Array(verticesCount * 3);

    for (let i = 0; i < verticesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 3;
    }
    return positions;
  }, []);

  return (
    <mesh scale={0.2} position-x={-1}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          itemSize={3}
          count={verticesCount}
          array={positions}
        />
      </bufferGeometry>
      <meshStandardMaterial side={2} color={0xff0000} />
    </mesh>
  );
}
