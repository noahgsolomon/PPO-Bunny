import torch
import onnxruntime
import numpy as np
import onnx2tf
import tensorflow as tf
from tensorflow.lite.python import interpreter as tflite_interpreter

onnx2tf.convert(
    input_onnx_file_path="model.onnx",
    output_folder_path="model.tf",
    copy_onnx_input_output_names_to_tflite=True,
    non_verbose=True,
)

# Now, test the newer TFLite model
interpreter = tf.lite.Interpreter(model_path="model.tf/model_float32.tflite")
interpreter.allocate_tensors()

# Get input and output tensors.
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Manually prepare your input data
distance = np.linalg.norm(np.array([4, 4], dtype=np.float32) - np.array([8, 8], dtype=np.float32))
observation = np.array([[4, 4, 8, 8, distance]], dtype=np.float32)

# Set the value of the input tensor
interpreter.set_tensor(input_details[0]['index'], observation)

# Run inference
interpreter.invoke()

# Get the value of the output tensor
output_data = interpreter.get_tensor(output_details[0]['index'])
print("[TFLite] Model Predictions:", output_data)
