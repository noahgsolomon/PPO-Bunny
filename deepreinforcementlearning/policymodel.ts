import * as tf from '@tensorflow/tfjs-node'

const model = tf.sequential()

model.add(tf.layers.dense({ inputShape: [402], units: 64, activation: 'tanh' }))
model.add(tf.layers.dense({ units: 4 }))

model.save('file:///Users/noahs/Desktop/three/deepreinforcementlearning/policy')
