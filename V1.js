/* @flow */

/*

This is just a draft of what a JavaScript consumption of
My Food Repo's API could be

*/

import { HttpError } from 'salathegroup_apis_common/src/ajax-helpers';
import GenericAPI, { type TCompressionType } from 'salathegroup_apis_common';

import DeviceInfo from 'react-native-device-info';

import * as CONST from './types/constants';
import * as API from './types/api';
import * as RESPONSE from './types/responses';

import type { TSubject } from './types/Subject';

import type {
  TUser,
  TPartialUser,
  TAuthenticatedLogin,
  TAnonymousLogin,
  TAuthenticatedUser,
  TAnonymousUser,
} from './types/User';

import type {
  TDish,
  TPostDish,
  TPatchDish,
  TPatchDishFood,
  TDishFood,
  TDishComment,
} from './types/Dish';

import type {
  TInstallationInfo,
  TInstallationExtraInfo,
} from './types/InstallationInfo';

import type { THistoricalData } from './types/HistoricalData';

import type {
  TDishRecognition,
  TDishRecognitionPrediction,
} from './types/DishRecognition';

type ErrorHandler = (error: HttpError) => void;

function simplifiedErrorReject(reject: (error: Object) => void): ErrorHandler {
  return function errorHandler(error: HttpError) {
    try {
      const response: { error: API.TError } = JSON.parse(
        error.request.responseText,
      );
      reject(response.error);
    } catch (e) {
      reject(error);
    }
  };
}

export default class MFRAPI<T: TInstallationExtraInfo> extends GenericAPI {
  static defaultHost = 'https://www.myfoodrepo.org';

  static revision = 'ALPHA';

  static defaultRecognitionInputSize = {
    width: 256,
    height: 256,
  };

  static installationInfo: TInstallationInfo<T>;

  uuid: string;

  user: TUser;

  constructor(
    apiKey: string,
    host: string = '',
    version: string = '1',
    compress: TCompressionType = 'auto',
  ) {
    super(apiKey, host || MFRAPI.defaultHost, version, compress);
  }

  async reportInstallation(
    uuid: string,
    extraInfo: T,
    timeout: number = 0,
  ): Promise<*> {
    this.uuid = uuid;
    if (!MFRAPI.installationInfo) {
      MFRAPI.installationInfo = {
        ...extraInfo,
        app_version: await DeviceInfo.getReadableVersion(),
        device_vendor: await DeviceInfo.getManufacturer(),
        device_name: await DeviceInfo.getModel(),
        os_name: await DeviceInfo.getSystemName(),
        os_version: await DeviceInfo.getSystemVersion(),
      };
    }
    return this.requestPatchURL(
      `installations/${uuid}`,
      { installation: MFRAPI.installationInfo },
      timeout,
    );
  }

  createUser(user: TUser, timeout: number = 0): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.requestPostURL('users', { user }, timeout)
      .then((response: RESPONSE.TLoginResponse) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  deleteUser(timeout: number = 0): Promise<Object> {
    return this.requestDeleteURL('users/me', null, timeout);
  }

  getUser(
    id?: number,
    timeout: number = 0,
  ): Promise<RESPONSE.TGetUserResponse> {
    const user = id || 'me';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}`, timeout)
      .then((response: RESPONSE.TGetUserResponse) => {
        // this.user = response.data.user;
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  updateUser(user: TPartialUser, timeout: number = 0): Promise<Object> {
    const id: string = typeof user.id === 'number' ? `${user.id}` : 'me';
    return this.requestPatchURL(`users/${id}`, { user }, timeout);
  }

  updateUserLogin(user: TPartialUser, timeout: number = 0): Promise<Object> {
    const id = typeof user.id === 'number' ? user.id : 'me';
    return this.requestPatchURL(
      `users/${id}/update_email_password`,
      { user },
      timeout,
    );
  }

  logIn(user: TUser, timeout: number = 0): Promise<RESPONSE.TLoginResponse> {
    return new Promise((resolve, reject) => {
      const sessionInfo = {
        user,
        installation: {
          uuid: this.uuid,
        },
      };
      this.requestPostURL('sessions', sessionInfo, timeout)
      .then((response: RESPONSE.TLoginResponse) => {
        this.sessionToken = response.data.session_token;
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  logOut(timeout: number = 0): Promise<RESPONSE.TLogoutResponse> {
    return new Promise((resolve, reject) => {
      if (this.sessionToken) {
        this.requestDeleteURL(`sessions/${this.sessionToken}`, {}, timeout)
        .then(resolve)
        .catch(simplifiedErrorReject(reject));
      } else {
        reject(new Error('No session token, logout impossible'));
      }
    });
  }

  recognizeDishImage(base64: string, mimetype: ?string, timeout: number = 0) {
    const uri = `data:${mimetype || 'image/png'};base64,${base64}`;
    return this.recognizeDishImageURI(uri, timeout);
  }

  recognizeDishImageURI(
    uri: string,
    timeout: number = 0,
  ): Promise<RESPONSE.TDishRecognitionResponse> {
    const body = {
      image: {
        file: uri,
      },
    };
    return this.requestPostURL('images/recognize', body, timeout);
  }

  getDishes(
    userId: ?number,
    lastSync: ?(Date | string),
    timeout: number = 0,
    sort: string = 'eaten_at desc',
  ): Promise<RESPONSE.TDishesResponse> {
    const user = userId || 'me';
    const params = [];
    if (typeof lastSync === 'string') {
      params.push(`last_sync_at=${lastSync}`);
    } else if (lastSync instanceof Date) {
      params.push(`last_sync_at=${lastSync.toISOString()}`);
    }
    if (sort) {
      params.push(`${'q[sorts]'}=${sort.replace(' ', '+')}`);
    }
    const paramsStr = params.length > 0 ? `?${params.join('&')}` : '';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}/dishes${paramsStr}`, timeout)
      .then((response: RESPONSE.TPreDishesResponse) => {
        const { data, ...rest } = response;
        const { dishes: adishes } = data;
        resolve({
          data: {
            dishes: adishes.map(d => ({ _record: 'get', ...d })),
          },
          ...rest,
        });
      })
      .catch((error: Error) => reject(error));
    });
  }

  getFood(
    id: number,
    timeout: number = 0,
  ): Promise<RESPONSE.TFoodResponse> {
    return this.requestGetURL(`foods/${id}`, timeout);
  }

  addDish(
    userId: ?number,
    dish: TPostDish,
    timeout: number = 0,
  ): Promise<RESPONSE.TDishResponse> {
    const user = userId || 'me';
    const { _record, ...sanitized } = dish;
    return new Promise((resolve, reject) => {
      this.requestPostURL(`users/${user}/dishes`, { dish: sanitized }, timeout)
      .then((response: RESPONSE.TPreDishResponse) => {
        const { data, ...rest } = response;
        const { dish: adish } = data;
        resolve({
          data: {
            dish: { _record: 'get', ...adish },
          },
          ...rest,
        });
      })
      .catch((error: Error) => reject(error));
    });
  }

  removeDish(
    userId: ?number,
    dishId: number,
    timeout: number = 0,
  ): Promise<RESPONSE.TDishResponse> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      this.requestDeleteURL(`users/${user}/dishes/${dishId}`, null, timeout)
      .then((response: RESPONSE.TPreDishResponse) => {
        const { data, ...rest } = response;
        const { dish: adish } = data;
        resolve({
          data: {
            dish: { _record: 'get', ...adish },
          },
          ...rest,
        });
      })
      .catch((error: Error) => reject(error));
    });
  }

  // TODO: See why we pass the whole dish here...
  duplicateDish(
    userId: ?number,
    dish: TPostDish,
    timeout: number = 0,
  ): Promise<RESPONSE.TDishResponse> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      const { _record, id, ...sanitized } = dish;
      this.requestPostURL(
        `users/${user}/dishes/${dish.id}/duplicate`,
        { dish: sanitized },
        timeout,
      )
      .then((response: RESPONSE.TPreDishResponse) => {
        const { data, ...rest } = response;
        const { dish: adish } = data;
        resolve({
          data: {
            dish: { _record: 'get', ...adish },
          },
          ...rest,
        });
      })
      .catch((error: Error) => reject(error));
    });
  }

  updateDish(
    dish: TPatchDish,
    timeout: number = 0,
  ): Promise<RESPONSE.TDishResponse> {
    return new Promise((resolve, reject) => {
      const { _record, id, ...sanitized } = dish;
      this.requestPatchURL(
        `dishes/${dish.id}`,
        { dish: sanitized },
        timeout,
      )
      .then((response: RESPONSE.TPreDishResponse) => {
        const { data, ...rest } = response;
        const { dish: adish } = data;
        resolve({
          data: {
            dish: { _record: 'get', ...adish },
          },
          ...rest,
        });
      })
      .catch((error: Error) => reject(error));
    });
  }

  getSubjects(
    userId?: ?number,
    timeout: number = 0,
  ): Promise<RESPONSE.TSubjectsResponse> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}/subjects`, timeout)
      .then((response: RESPONSE.TSubjectsResponse) => {
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  addSubject(
    subjectKey: string,
    userId?: ?number,
    timeout: number = 0,
  ): Promise<RESPONSE.TSubjectsResponse> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      const info = {
        subject_attachment: {
          key: subjectKey,
        },
      };
      this.requestPostURL(`users/${user}/subject_attachments`, info, timeout)
      .then((response: RESPONSE.TSubjectsResponse) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  removeSubject(
    subjectKey: string,
    userId?: ?number,
    timeout: number = 0,
  ): Promise<RESPONSE.TSubjectsResponse> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      this.requestDeleteURL(
        `users/${user}/subject_attachments/${subjectKey}`,
        null,
        timeout,
      )
      .then((response: RESPONSE.TSubjectsResponse) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  userForgotPassword(
    email: string,
    timeout: number = 0,
  ): Promise<RESPONSE.TSubjectsResponse> {
    return new Promise((resolve, reject) => {
      const info = {
        user: {
          email,
        },
      };
      this.requestPostURL('user_forgot_password', info, timeout)
      .then((response: RESPONSE.TSubjectsResponse) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  nutrients(timeout: number = 0): Promise<RESPONSE.TNutrientsResponse> {
    return new Promise((resolve, reject) => {
      this.requestGetURL('nutrients', timeout)
      .then((response: RESPONSE.TNutrientsResponse) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }
}

export const MFRNutrientCategories = CONST.NutrientCategories;
export const MFRCategoryNutrients = CONST.CategoryNutrients;

export type MFRInstallationInfo<T> = TInstallationInfo<T>;
export type MFRUserInfo = TUser;
export type MFRDish = TDish;
export type MFRDishFood = TDishFood;
export type MFRPostDish = TPostDish;
export type MFRPatchDish = TPatchDish;
export type MFRPatchDishFood = TPatchDishFood;
export type MFRDishes = TDish[];
export type MFRDishComment = TDishComment;
export type MFRAuthenticatedLoginInfo = TAuthenticatedLogin;
export type MFRAnonymousLoginInfo = TAnonymousLogin;
export type MFRAuthenticatedUserInfo = TAuthenticatedUser;
export type MFRAnonymousUserInfo = TAnonymousUser;
export type MFRPartialUserInfo = TPartialUser;
export type MFRGender = CONST.TGender;
export type MFRSubject = TSubject;
export type MFRHistoricalData = THistoricalData<*>;
export type MFRAPIResponseType<T> = API.TResponseType<T>;
export type MFRAPIError = API.TError;
export type MFRDishRecognitionPredictionType = TDishRecognitionPrediction;
export type MFRDishRecognitionType = TDishRecognition;
