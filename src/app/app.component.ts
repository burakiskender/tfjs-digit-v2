import { Component, ViewChild, OnInit } from '@angular/core';
import { DrawableDirective } from './drawable.directive';

import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <div class="drawing-board">
        <h3>
          Draw a number between <strong class="highlight">0</strong> to
          <strong class="highlight">9</strong>
        </h3>
        <div class="wrapper">
          <canvas appDrawable (newImage)="predict($event)"></canvas><br />
        </div>
        <button class="btn btn-lg btn-primary" (click)="clear()">Erase</button>
      </div>
      <div class="prediction">
        <h3>
          Predicted number:
          <strong class="highlight">{{ predictedNumber }}</strong>
        </h3>
      </div>
      <footer>
        <p>
          Made by
          <a class="highlight" href="http://aaronhma.com/" target="_blank"
            >Aaron Ma</a
          >
        </p>
      </footer>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public linearModel: tf.Sequential;
  public model: tf.LayersModel;
  public predictedNumber = '';

  @ViewChild(DrawableDirective, { static: false }) canvas;

  ngOnInit() {
    this.loadModel();
  }

  // Load pre-trained Digital Classifier model
  // Model stored at: https://github.com/aaronhma/tfjs-digit-v2/tree/master/src/assets
  // Tensorflow.js layers format is a directory containing a model.json file and a set of sharded weight files in binary format.
  // model.json contains both the model topology (aka "architecture" or "graph": a description of the layers and how they are
  // connected) and a manifest of the weight files.
  async loadModel() {
    // Load a model that composed of layer objects
    // Use Tensorflow.js converter to convert digit recognizer model to Tensorflow.js Layers format
    this.model = await tf.loadLayersModel('assets/model.json');
  }

  async predict(imageData: ImageData | null) {
    // condition matched when clear button is clicked
    if (imageData === null) {
      return;
    }

    // use tidy function to help avoid memory leaks with automatic memory cleanup
    await tf.tidy(() => {
      // Convert the canvas pixels to TensorFlow Tensor
      let img = tf.browser.fromPixels(imageData, 1);
      // Data preparation: remove the color dimension and normalizing pixel values
      img = img.reshape([1, 28, 28, 1] as any);
      // Convert the tensor to a new type: float32
      img = tf.cast(img, 'float32');

      // Use pre-trained model execute the inference for the input tensor (canvas pixel)
      const output = this.model.predict(img) as any;

      // Save predictions on the component
      const predictions: number[] = Array.from(output.dataSync());

      for (let i = 0; i < predictions.length; i++) {
        // Get predicted number
        if (predictions[i] === 1) {
          this.predictedNumber = i.toString();
        }
      }
    });
  }

  public clear() {
    this.predictedNumber = '';
    this.canvas.clear();
  }
}
