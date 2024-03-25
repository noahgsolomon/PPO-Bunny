from stable_baselines3 import PPO
import os
from snakeenv import SnekEnv
import time

# Specify the directory where the pre-trained model is located
model_dir = "models/1711382731/5000"

env = SnekEnv()
env.reset()

# Load the pre-trained model
model = PPO.load(f"{model_dir}.zip", env=env)

episodes = 5

for ep in range(episodes):
    obs = env.reset()
    done = False

    while not done:
        action, _states = model.predict(obs)
        obs, rewards, done, info = env.step(action)
        print(done)

env.close()
