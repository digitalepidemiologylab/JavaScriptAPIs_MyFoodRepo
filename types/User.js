// @flow

import * as CONST from './constants';
import type { THistoricalData } from './HistoricalData';

export type TAuthenticatedLogin = {|
  auth_type: CONST.TAuthTypeEmailPassword,
    email: string,
      password: string,
        new_password ?: string,
|};

export type TAnonymousLogin = {|
  auth_type: CONST.TAuthTypeAnonymous,
|};

type TUserCommon = {|
  id?: number,
  private_dish_media ?: boolean,
  first_name ?: string,
  last_name ?: string,
  nickname ?: string,
  avatar_url ?: string,
  weights ?: Array<THistoricalData<{| weight: number |}>>,
  height ?: number,
  sex ?: CONST.TGender,
  date_of_birth ?: Date,
|};

export type TAuthenticatedUser = {|
  ...TAuthenticatedLogin,
  ...TUserCommon,
|};

export type TAnonymousUser = {|
  ...TAnonymousLogin,
  ...TUserCommon,
|};

export type TUser = TAnonymousUser | TAuthenticatedUser;

export type TPartialUser =
  | $Shape<TAnonymousLogin>
  | $Shape<TAuthenticatedLogin>
  | $Shape<TUserCommon>;
