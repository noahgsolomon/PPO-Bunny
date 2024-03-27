from stable_baselines3 import PPO
from env_PPO import SnakeEnv
import Constants
import pygame

HEIGHT = Constants.HEIGHT
WIDTH = Constants.WIDTH


env = SnakeEnv()
model = PPO.load('models/100000.zip', env=env)

episode = 10
level = 0

while level <= episode and env.run:
    obs, _ = env.reset()
    env.done = False
    score = 0

    level += 1
    while not env.done and env.run:

        env.render()
        action, _states = model.predict(obs)
        obs, reward, done, done, info = env.step(action)
        score += reward

    print('Episode: {} Score:{}'.format(level, score))

pygame.display.quit()
pygame.quit()
print("Game Over")
