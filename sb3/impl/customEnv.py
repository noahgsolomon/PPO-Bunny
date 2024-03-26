import gymnasium as gym
import numpy as np
from gymnasium import spaces

class BunnyEnv(gym.Env):

    metadata = {"render_modes": ["human"], "render_fps": 30}

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
        self.observation_space = spaces.Box(low=np.array([[0, -3]] * 25), high=np.array([[1, 3]] * 25), dtype=np.int32)
