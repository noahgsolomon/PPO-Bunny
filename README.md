# PPO Bunny 🐰

A real-time web demonstration of Proximal Policy Optimization (PPO) featuring cute bunnies navigating complex environments to find optimal rewards.

<img width="1558" alt="Screenshot 2025-07-03 at 9 41 23 AM" src="https://github.com/user-attachments/assets/4fd82867-86c9-4823-aa8e-00b3dc952874" />


## Overview

PPO Bunny is an interactive visualization that demonstrates reinforcement learning in action. Watch as multiple AI-controlled bunnies learn to navigate through grid-based environments, avoiding obstacles and finding rewards using PPO (Proximal Policy Optimization).

## Features

- **Real-time AI Training**: See PPO agents learn and adapt in your browser
- **Multiple Difficulty Levels**: Two distinct environments with increasing complexity
- **Smooth 3D Visualization**: Built with React Three Fiber for performant 3D graphics
- **Multi-Agent System**: 10 agents learning simultaneously
- **Dynamic Environments**: Level 2 features moving obstacles for added challenge

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **3D Graphics**: React Three Fiber, Three.js
- **AI/ML**: ONNX Runtime Web for in-browser inference
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Animation**: React Spring

## Getting Started

### Prerequisites

- Node.js 14+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/noahgsolomon-ppo-bunny.git

# Navigate to project directory
cd noahgsolomon-ppo-bunny

# Install dependencies
npm install
# or
yarn install

# Run the development server
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

## How It Works

### The Environment

- **Grid World**: 25x25 tile-based environment
- **Agents**: Bunny agents start from random positions
- **Goal**: Find the pink reward tile while avoiding hologram tiles
- **Obstacles**: 
  - Level 1: Static hologram tiles (instant failure)
  - Level 2: Moving hologram tiles + vision-based navigation

### The AI

The bunnies use PPO (Proximal Policy Optimization) to learn optimal policies:

- **State Space**: Agent position, target position, distance to goal (+ vision in Level 2)
- **Action Space**: 4 discrete actions (up, down, left, right)
- **Reward Structure**: Positive reward for reaching the goal, negative for hitting obstacles

### Model Details

- **Architecture**: Actor-Critic neural network
- **Training**: Python implementation with stable-baselines3
- **Deployment**: ONNX models running in-browser via ONNX Runtime Web
- **Hyperparameters**: See in-app "Model Details" for complete configuration

## Project Structure

```
├── app/
│   ├── (game)/
│   │   ├── page.tsx          # Main game page
│   │   ├── LevelOne.tsx      # Level 1 implementation
│   │   ├── LevelTwo.tsx      # Level 2 implementation
│   │   ├── Player.tsx        # Player bunny component
│   │   ├── runModel.ts       # ONNX inference logic
│   │   └── store/           # Zustand stores
│   └── components/          # UI components
├── public/
│   └── models/             # 3D models and ONNX files
└── train/                  # Python training scripts
```

## Training Your Own Model

The `train/` directory contains Python scripts for training new PPO models:

```bash
cd train
python ppo.py  # Train the model
python torch2onnx.py  # Convert to ONNX format
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Links

- [Live Demo](https://ppobunny.vercel.app)
- [Video Explanation](https://www.youtube.com/watch?v=TjHH_--7l8g&t=2019s)
- [PPO Paper](https://fse.studenttheses.ub.rug.nl/25709/1/mAI_2021_BickD.pdf)
