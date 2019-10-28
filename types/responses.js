// @flow

import * as API from './api';
import type { TDishRecognition } from './DishRecognition';
import type { TUser } from './User';
import type { TResponseDish, TDish } from './Dish';
import type { TSubject } from './Subject';
import type { TNutrient } from './Nutrient';

export type TLoginResponse = API.TResponseType<{
  session_token: string,
}>;

export type TLogoutResponse = API.TResponseType<{
  session_token: string,
}>;

export type TDishRecognitionResponse = API.TResponseType<{
  recognition: TDishRecognition,
}>;

export type TGetUserResponse = API.TResponseType<{
  user: TUser,
}>;

export type TPreDishesResponse = API.TResponseType<{
  dishes: TResponseDish[],
}>;

export type TDishesResponse = API.TResponseType<{
  dishes: TDish[],
}>;

export type TPreDishResponse = API.TResponseType<{
  dish: TResponseDish,
}>;

export type TDishResponse = API.TResponseType<{
  dish: TDish,
}>;

export type TSubjectsResponse = API.TResponseType<{
  subjects: TSubject[]
}>;

export type TNutrientsResponse = API.TResponseType<{
  subjects: TNutrient[]
}>;

export type TFoodResponse = API.TResponseType<{
}>;
