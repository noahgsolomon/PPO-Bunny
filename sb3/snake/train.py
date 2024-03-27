from env_PPO import SnakeEnv
import pygame

from stable_baselines3 import PPO
import traceback
import sys
env = SnakeEnv()


try:
    model = PPO('MlpPolicy',env, verbose=1, tensorboard_log='logs')

    TIMESTEPS = 5000
    iters = 0
    while iters < 20:
        iters += 1
        model.learn(total_timesteps=TIMESTEPS, callback=None, log_interval=1, tb_log_name='PPO', reset_num_timesteps=True, progress_bar=True)
        model.save(f"models/new/{TIMESTEPS*iters}")

except Exception as e:
    exc_type, exc_obj, tb = sys.exc_info()
    line_number = tb.tb_lineno
    print("! Error at", line_number,"th line*")
    traceback.print_exc()
    pygame.quit()
