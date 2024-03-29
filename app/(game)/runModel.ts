import { InferenceSession, Tensor } from 'onnxruntime-web'

import * as ort from 'onnxruntime-web'

ort.InferenceSession

export async function createModelGpu(model: ArrayBuffer): Promise<InferenceSession> {
  return await InferenceSession.create(model, { executionProviders: ['webgl'] })
}
export async function createModelCpu(model: ArrayBuffer): Promise<InferenceSession> {
  return await InferenceSession.create(model, {
    executionProviders: ['wasm'],
  })
}

export async function warmupModel(model: InferenceSession) {
  // OK. we generate a random input and call Session.run() as a warmup query
  const warmupTensor = new Tensor('float32', new Float32Array(5), [1, 5])

  warmupTensor.data[0] = 0
  warmupTensor.data[1] = 0
  warmupTensor.data[2] = 0
  warmupTensor.data[3] = -4
  warmupTensor.data[4] = 4

  try {
    const feeds: Record<string, Tensor> = {}
    feeds[model.inputNames[0]] = warmupTensor
    await model.run(feeds)
  } catch (e) {
    console.error(e)
  }
}

export async function runModel(model: InferenceSession, input: number[]) {
  const start = new Date()
  const tensor = new Tensor('float32', new Float32Array(5), [1, 5])

  tensor.data[0] = input[0]
  tensor.data[1] = input[1]
  tensor.data[2] = input[2]
  tensor.data[3] = input[3]
  tensor.data[4] = input[4]
  try {
    const feeds: Record<string, Tensor> = {}
    feeds[model.inputNames[0]] = tensor
    const outputData = await model.run(feeds)
    const end = new Date()
    const inferenceTime = end.getTime() - start.getTime()
    const output = outputData[model.outputNames[0]].data[0]

    return [output, inferenceTime]
  } catch (e) {
    console.error(e)
    throw new Error()
  }
}
