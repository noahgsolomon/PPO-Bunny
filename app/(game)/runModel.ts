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

export async function runModel(model: InferenceSession, input: number[][]) {
  const start = new Date()
  const outputs: number[] = []
  const inferenceTimes: number[] = []

  for (const singleInput of input) {
    const tensor = new Tensor('float32', new Float32Array(singleInput), [1, 5])

    try {
      const feeds: Record<string, Tensor> = {}
      feeds[model.inputNames[0]] = tensor
      const outputData = await model.run(feeds)
      const end = new Date()
      const inferenceTime = end.getTime() - start.getTime()
      const output = outputData[model.outputNames[0]].data[0]
      outputs.push(Number(output))
      inferenceTimes.push(inferenceTime)
    } catch (e) {
      console.error(e)
      throw new Error()
    }
  }

  const averageInferenceTime = inferenceTimes.reduce((a, b) => a + b, 0) / inferenceTimes.length
  return [outputs, averageInferenceTime]
}
