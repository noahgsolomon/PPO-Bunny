import * as tf from '@tensorflow/tfjs-node'

const model = tf.sequential()
model.add(
  tf.layers.conv2d({
    inputShape: [5, 5, 6], // Assumes a 3x3 grid with 6 channels (6 for tile types)
    kernelSize: 3,
    filters: 16,
    activation: 'relu',
  }),
)
model.add(tf.layers.flatten())
model.add(
  tf.layers.dense({
    units: 256,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
  }),
)
model.add(
  tf.layers.dense({
    units: 4, // Assumes 4 possible actions (up, down, left, right)
  }),
)

model.save('file:///Users/noahs/Desktop/threejs/policy')
