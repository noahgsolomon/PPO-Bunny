
from stable_baselines3 import PPO
import torch
from stable_baselines3.common.policies import BasePolicy
import numpy as np

class OnnxableSB3Policy(torch.nn.Module):
    def __init__(self, policy: BasePolicy):
        super().__init__()
        self.policy = policy

    def forward(self, observation: torch.Tensor):
        # policy() returns `actions, values, log_prob` for PPO
        return self.policy(observation, deterministic=False)

model = PPO.load("models/new/10000.zip")
onnx_policy = OnnxableSB3Policy(model.policy)

distance  = np.linalg.norm(np.array([0, 0]) - np.array([1 ,1]))
dummy_input = torch.Tensor([0, 0, 1, 1, distance]).unsqueeze(0)
torch.onnx.export(
    onnx_policy,
    dummy_input,
    "model.onnx",
    opset_version=17,
    input_names=["input"],
)
