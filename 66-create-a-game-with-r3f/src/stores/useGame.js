import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export default create(
  subscribeWithSelector((set) => {
    return {
      startTime: 0,
      blockSeed: 0,
      endTime: 0,
      blockCount: 3,
      phase: "ready",
      start: () => {
        set((state) => {
          if (state.phase === "ready") {
            return { phase: "playing", startTime: Date.now() };
          }
          return {};
        });
      },

      restart: (reason) => {
        set((state) => {
          if (state.phase === "playing" || state.phase === "ended") {
            if (reason !== "falling") {
              return {
                phase: "ready",
                blockSeed: Math.random(),
              };
            }
            return { phase: "ready" };
          }
          return {};
        });
      },

      end: () => {
        set((state) => {
          if (state.phase === "playing") {
            return { phase: "ended", endTime: Date.now() };
          }
          return {};
        });
      },
    };
  })
);
