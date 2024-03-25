import gymnasium as gym
from stable_baselines3 import A2C
import os

models_dir = "models/A2C"
logdir = "logs"

if not os.path.exists(models_dir):
    os.makedirs(models_dir)

if not os.path.exists(logdir):
    os.makedirs(logdir)

env = gym.make('LunarLander-v2')
env.reset()

model = A2C('MlpPolicy', env, verbose=1, tensorboard_log=logdir)

TIMESTEPS = 10000
iters = 0
for i in range(30):
    model.learn(total_timesteps=TIMESTEPS, reset_num_timesteps=False, tb_log_name="A2C", progress_bar=True)
    model.save(f"{models_dir}/{TIMESTEPS*i}")

episodes = 5

env = gym.make('LunarLander-v2', render_mode="human")
env.reset()

for ep in range(episodes):
    obs, info = env.reset()
    print(f"obs: {obs}")
    terminated = False
    truncated = False
    while not terminated and not truncated:
        action, _states = model.predict(obs)
        obs, rewards, terminated, truncated, info = env.step(action)
        env.render()

env.close()
