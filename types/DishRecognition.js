// @flow

import * as CONST from './constants';

export type TDishRecognitionPrediction = {|
  class: string,
  confidence: number,
|};

export type TDishRecognition = {|
  ml_api_version: string,
  image_recognition_id: string,
  image_url: string,
  predictions: Array<TDishRecognitionPrediction>,
  status: CONST.TDishRecognitionStatus,
|};
