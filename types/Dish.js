// @flow

import * as CONST from './constants';
import type { TFood } from './Food';
import type { TMedia, TPostMedia } from './Media';

export type TDishFood = {|
  id: number,
  food: TFood,
  present_quantity: ?number,
  present_unit: ?string,
  eaten_quantity: ?number,
  eaten_unit: ?string,
|};

export type TPostDishFoodFood = {|
  _type: 'barcode',
  country: CONST.TCountry,
  barcode: string,
|};

export type TPostDishFood = {|
  food: TPostDishFoodFood,
  present_quantity?: number,
  present_unit?: string,
  eaten_quantity?: number,
  eaten_unit?: string,
|};

export type TPatchDishFood = {|
  id: number,
  present_quantity?: number,
  present_unit?: string,
  eaten_quantity?: number,
  eaten_unit?: string,
|};

export type TDishComment = {|
  id: number,
  user: {
    id: number,
    display_name: string,
    avatar_url: string,
  },
  message: string,
  created_at: string,
  updated_at: string,
|};

export type TPostDishComment = {|
  message: string,
|};

export type TResponseDish = {|
  id: number,
  uuid?: ?string,
  eaten_at: string,
  eaten_at_utc_offset: number,
  user_id: number,
  name: string,
  note: string,
  status: CONST.TDishStatus,
  media?: $ReadOnlyArray<TMedia>,
  dish_foods?: $ReadOnlyArray<TDishFood>,
  comments: $ReadOnlyArray<TDishComment>,
  created_at: string,
  updated_at: string,
|};

export type TDish = {|
  _record: 'get',
  _destroyed?: boolean, // eslint-disable-line no-underscore-dangle

  ...TResponseDish,
|};

export type TPostDish = {|
  _record: 'post',

  id: number,
  uuid?: ?string,
  eaten_at: string,
  eaten_at_utc_offset: number,
  submitting?: boolean,
  name?: string,
  note?: string,
  media?: $ReadOnlyArray<TPostMedia>,
  dish_foods?: $ReadOnlyArray<TPostDishFood>,
  comments?: $ReadOnlyArray<TPostDishComment>,
  pictureUri?: string,
|};

export type TPatchDish = {|
  _record: 'patch',

  id: number,
  eaten_at?: string,
  eaten_at_utc_offset?: number,
  submitting?: boolean,
  name?: string,
  note?: string,
  media?: $ReadOnlyArray<TPostMedia>,
  dish_foods?: $ReadOnlyArray<TPatchDishFood>,
  comments?: $ReadOnlyArray<TPostDishComment>,
|};
