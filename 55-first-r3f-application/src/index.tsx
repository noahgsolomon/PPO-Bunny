import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas, extend } from "@react-three/fiber";
import Experience from "./Experience";
import React from "react";

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  <>
    <Canvas>
      <Experience />
    </Canvas>
  </>
);
