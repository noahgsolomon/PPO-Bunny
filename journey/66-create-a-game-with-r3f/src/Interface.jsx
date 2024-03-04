import { useKeyboardControls } from "@react-three/drei";
import useGame from "./stores/useGame";
import { useEffect, useRef } from "react";
import { addEffect } from "@react-three/fiber";

export default function Interface() {
  const time = useRef();

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();
      let elapsedTime = 0;

      if (state.phase === "playing") {
        elapsedTime = Date.now() - state.startTime;
      } else if (state.phase === "ended") {
        elapsedTime = state.endTime - state.startTime;
      }

      elapsedTime /= 1000;
      elapsedTime = elapsedTime.toFixed(2);

      if (time.current) {
        time.current.textContent = elapsedTime;
      }
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  const controls = useKeyboardControls((state) => state);

  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);

  return (
    <div className="interface">
      {phase === "ended" ? (
        <div onClick={restart} className="restart">
          Restart
        </div>
      ) : null}
      <div ref={time} className="time">
        0.00
      </div>
      <div className="controls">
        <div className="raw">
          <div className={`key ${controls.forward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key ${controls.leftward ? "active" : ""}`}></div>
          <div className={`key ${controls.backward ? "active" : ""}`}></div>
          <div className={`key ${controls.rightward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${controls.jump ? "active" : ""}`}></div>
        </div>
      </div>
    </div>
  );
}
