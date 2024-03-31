import torch
from env_PPO import SnakeEnv
import numpy as np
import gymnasium as gym
from ppo import Actor, Args, make_env
import tyro
from torch.distributions.categorical import Categorical


class OnnxableAgent(torch.nn.Module):
    def __init__(self, agent):
        super().__init__()
        self.agent = agent

    def forward(self, observation: torch.Tensor):
        logits = self.agent(observation)
        probs = Categorical(logits=logits)
        action = probs.sample()
        print(action)
        return action
    
args = tyro.cli(Args)
device = torch.device("cuda" if torch.cuda.is_available() and args.cuda else "cpu")

# Load the saved agent
agent = Actor(gym.vector.SyncVectorEnv([make_env(args.env_id, i, args.capture_video, '') for i in range(args.num_envs)])).to(device)
agent.load_state_dict(torch.load("models/actor/agent_final.pth"))

# Create an OnnxableAgent instance
onnx_agent = OnnxableAgent(agent)

# Create a dummy input tensor
distance = np.linalg.norm(np.array([0, 0]) - np.array([1, 1]))
dummy_input = torch.Tensor([0, 0, 1, 1, distance]).unsqueeze(0)

# Export the model to ONNX format
torch.onnx.export(
    onnx_agent,
    dummy_input,
    "actor.onnx",
    opset_version=17,
    input_names=["input"],
    output_names=["action", "log_prob", "entropy", "value"],
    dynamic_axes={
        "input": {0: "batch_size"},
        "action": {0: "batch_size"},
        "log_prob": {0: "batch_size"},
        "entropy": {0: "batch_size"},
        "value": {0: "batch_size"},
    },
)