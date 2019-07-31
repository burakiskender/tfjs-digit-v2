import { Component, ViewChild, OnInit } from '@angular/core';
import { DrawableDirective } from './drawable.directive';

import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public linearModel: tf.Sequential;
  public model: tf.LayersModel;
  public predictions: Array<number> | undefined;
  predictedNumber: string;

  @ViewChild(DrawableDirective, {static: false}) canvas;

  ngOnInit() {
    this.loadModel();
  }


  //// LOAD PRETRAINED KERAS MODEL ////

  async loadModel() {
    this.model = await tf.loadLayersModel('assets/model.json');
  }

  async predict(imageData: ImageData | null) {
    if (imageData === null) {
      this.predictions = undefined;
      return;
    }

    const pred = await tf.tidy(() => {

      // Convert the canvas pixels to
      let img = tf.browser.fromPixels(imageData, 1);
      img = img.reshape([1, 28, 28, 1] as any);
      img = tf.cast(img, 'float32');

      // Make and format the predications
      const output = this.model.predict(img) as any;

      // Save predictions on the component
      this.predictions = Array.from(output.dataSync());

      for (let i = 0; i < this.predictions.length; i++) {
        if (this.predictions[i] === 1) {
          this.predictedNumber = i.toString();
          console.log('Predicted number: ', this.predictedNumber)
        }
      }
      if (this.predictedNumber === '') {
        this.predictedNumber = ':(';
        console.log('Predicted number: ', this.predictedNumber)
      }
    });

  }

  clear() {
    this.predictedNumber = "";
  }

}
