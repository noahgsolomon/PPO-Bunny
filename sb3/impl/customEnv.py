from typing import List
import gymnasium as gym
import numpy as np
from gymnasium import spaces

class BunnyEnv(gym.Env):

    metadata = {"render_modes": ["human"], "render_fps": 30}

    # actions
    LEFT = 0
    RIGHT = 1
    UP = 2
    DOWN = 3

    TILE_COUNT = 225 # 15**2
    TOTAL_HEARTS = 3
    VISION_LENGTH = 2


    def __init__(self):

        super().__init__()

        # 0 -> left
        # 1 -> right
        # 2 -> up
        # 3 -> down
        self.action_space = spaces.Discrete(4)

        # hearts (min, max): [0, 1]
        # coins (min, max): [-3, 3]
        # observation shape: [batch, 5x5, 2]
        self.observation_space = spaces.Box(low=np.array([[0, -3]] * 25), high=np.array([[1, 3]] * 25), dtype=np.float32)

        self._tile_map = self.generateTileMap()

    def step(self, action: int):
        print(action)
        return
    #
    # def step(self, seed=None, options=None):
    #     return observation, info
    #
    # def render(self):
    #
    #
    # def close(self):
    #

    def generateTileMap(self) -> List[List[int]]:
        return [[0]]
