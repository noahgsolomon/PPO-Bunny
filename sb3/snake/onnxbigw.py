import onnx
from stable_baselines3 import PPO
import torch
import onnxruntime as ort
import numpy as np

onnx_path = "model.onnx"
onnx_model = onnx.load(onnx_path)
onnx.checker.check_model(onnx_model)


distance  = np.linalg.norm(np.array([4, 4], dtype=np.float32) - np.array([8, 8], dtype=np.float32))
observation = np.array([[4, 4, 8, 8, distance]], dtype=np.float32)
ort_sess = ort.InferenceSession(onnx_path)
actions, values, log_prob = ort_sess.run(None, {"input": observation})

print(actions, values, log_prob)


model = PPO.load("models/100000.zip")
# Check that the predictions are the same
with torch.no_grad():
    print(model.policy(torch.as_tensor(observation), deterministic=True))
