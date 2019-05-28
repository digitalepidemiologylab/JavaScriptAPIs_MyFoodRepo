// @flow

import * as CONST from './constants';

import type { TTranslations } from './Translations';
import type { TNutrient } from './Nutrient';

type URL = string;

type TFoodImage = {|
  categories: CONST.TFoodImageCategory[],
  thumb: URL,
  medium: URL,
  large: URL,
  xlarge: URL,
|};

type TFoodNutrient = {|
  id: number,
  per_hundred: number,
  nutrient: TNutrient,
|};

export type TFood = {|
  id: number,
  type: CONST.TFoodTypeFoodRepo,
  country: CONST.TCountry,
  barcode: string,
  name_translations: TTranslations,
  display_name_translations: TTranslations,
  unit: CONST.TFoodUnit,
  images: TFoodImage[],
  food_nutrients: TFoodNutrient[],
|};
