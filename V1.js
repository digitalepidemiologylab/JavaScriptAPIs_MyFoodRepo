/* @flow */

/*

This is just a draft of what a JavaScript consumption of
MyFoodRepo's API could be

*/

import { HttpError } from 'salathegroup_apis_common/ajaxhelpers';
import GenericAPI from 'salathegroup_apis_common';

import DeviceInfo from 'react-native-device-info';

type InstallationInfo = {
  app_version: string,
  device_vendor: string,
  device_name: string,
  os_name: string,
  os_version: string,
};

type TAttribute = {|
  id: number,
|};

/*
type TAttributeDestroy = {|
  ...TAttribute,
  ...{| _destroy: boolean |},
|};

type TNewHistoricalData<T> = {|
  ...{| date: Date |},
  ...T,
|};
*/

type TExistingHistoricalData<T> = {|
  ...TAttribute,
  ...{| date: Date |},
  ...T,
|};

type THistoricalData<T> =
  // | TNewHistoricalData<T>
  TExistingHistoricalData<T>;
// | TAttributeDestroy;

type TGender = 'male' | 'female';

type TWeightData = THistoricalData<{| weight: number |}>;

type CommonUserInfo = {|
  id?: number,
  first_name?: string,
  last_name?: string,
  nickname?: string,
  avatar_url?: string,
  weights?: Array<TWeightData>,
  height?: number,
  gender?: TGender,
  date_of_birth?: Date,
|};

type AuthenticatedLoginInfo = {|
  auth_type: 'email_password',
  email: string,
  password: string,
  new_password?: string,
|};

type AnonymousLoginInfo = {|
  auth_type: 'anonymous',
|};

type AuthenticatedUserInfo = {|
  ...AuthenticatedLoginInfo,
  ...CommonUserInfo,
|};

type AnonymousUserInfo = {|
  ...AnonymousLoginInfo,
  ...CommonUserInfo,
|};

type UserInfo = AnonymousUserInfo | AuthenticatedUserInfo;

type PartialUserInfo =
  | $Shape<AnonymousLoginInfo>
  | $Shape<AuthenticatedLoginInfo>
  | $Shape<CommonUserInfo>;

type APIResponseType<T> = {
  data: T,
  meta: {
    api_version: string,
  },
  status: number,
};

type LoginResponse = {
  session_token: string,
};

type LogoutResponse = {
  session_token: string,
};

type DishRecognitionPredictionType = {
  class: string,
  confidence: number,
};

type DishRecognitionType = {
  image_id: number,
  image_recognition_id: string,
  image_url: string,
  predictions: Array<DishRecognitionPredictionType>,
  status: string,
};

type DishRecognitionResponseType = {
  recognition: DishRecognitionType,
};

let installation: InstallationInfo;

type APIError = {
  type: string,
  code: string,
  message: string,
  reason: string,
  details?: {
    [keys: string]: {
      issues: Array<{
        count?: number,
        code: string,
        message: string,
      }>,
    },
  },
};

type ErrorHandler = (error: HttpError) => void;

type Dish = {
  id: number,
  eaten_at: Date,
};

type Dishes = Dish[];

function simplifiedErrorReject(reject: (error: Object) => void): ErrorHandler {
  return function errorHandler(error: HttpError) {
    try {
      const response: { error: APIError } = JSON.parse(
        error.request.responseText,
      );
      reject(response.error);
    } catch (e) {
      reject(error);
    }
  };
}

export default class MFRAPI extends GenericAPI {
  static defaultHost = 'https://www.myfoodrepo.org';
  static revision = 'ALPHA';

  static defaultRecognitionInputSize = {
    width: 256,
    height: 256,
  };

  uuid: string;
  user: UserInfo;

  constructor(apiKey: string, host: string = '', version: string = '1') {
    super(apiKey, host || MFRAPI.defaultHost, version);
  }

  reportInstallation(uuid: string, timeout: number = 0): Promise<*> {
    this.uuid = uuid;
    if (!installation) {
      installation = {
        app_version: DeviceInfo.getReadableVersion(),
        device_vendor: DeviceInfo.getManufacturer(),
        device_name: DeviceInfo.getModel(),
        os_name: DeviceInfo.getSystemName(),
        os_version: DeviceInfo.getSystemVersion(),
      };
    }
    return this.requestPatchURL(
      `installations/${uuid}`,
      { installation },
      timeout,
    );
  }

  createUser(user: UserInfo, timeout: number = 0): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.requestPostURL('users', { user }, timeout)
      .then((response: APIResponseType<LoginResponse>) => {
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
  ): Promise<APIResponseType<{ user: UserInfo }>> {
    const user = id || 'me';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}`, timeout)
      .then((response: APIResponseType<{ user: UserInfo }>) => {
        // this.user = response.data.user;
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  updateUser(user: PartialUserInfo, timeout: number = 0): Promise<Object> {
    const id: string = typeof user.id === 'number' ? `${user.id}` : 'me';
    return this.requestPatchURL(`users/${id}`, { user }, timeout);
  }

  updateUserLogin(user: PartialUserInfo, timeout: number = 0): Promise<Object> {
    const id = typeof user.id === 'number' ? user.id : 'me';
    return this.requestPatchURL(
      `users/${id}/update_email_password`,
      { user },
      timeout,
    );
  }

  logIn(
    user: UserInfo,
    timeout: number = 0,
  ): Promise<APIResponseType<LoginResponse>> {
    return new Promise((resolve, reject) => {
      const sessionInfo = {
        user,
        installation: {
          uuid: this.uuid,
        },
      };
      this.requestPostURL('sessions', sessionInfo, timeout)
      .then((response: APIResponseType<LoginResponse>) => {
        this.sessionToken = response.data.session_token;
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  logOut(timeout: number = 0): Promise<APIResponseType<LogoutResponse>> {
    return new Promise((resolve, reject) => {
      this.requestDeleteURL(`sessions/${this.sessionToken}`, {}, timeout)
      .then(resolve)
      .catch(simplifiedErrorReject(reject));
    });
  }

  recognizeDishImage(
    base64: string,
    mimetype: string = 'image/png',
    timeout: number = 0,
  ): Promise<Object> {
    const body = {
      image: {
        file: `data:${mimetype};base64,${base64}`,
      },
    };
    return this.requestPostURL('images/recognize', body, timeout);
  }

  getDishes(
    user_id?: number,
    timeout: number = 0,
  ): Promise<APIResponseType<{ dishes: Dishes }>> {
    const user = user_id || 'me';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}/dishes`, timeout)
      .then((response: APIResponseType<{ dishes: Dishes }>) => {
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }
}

export type MFRInstallationInfo = InstallationInfo;
export type MFRUserInfo = UserInfo;
export type MFRAuthenticatedLoginInfo = AuthenticatedLoginInfo;
export type MFRAnonymousLoginInfo = AnonymousLoginInfo;
export type MFRAuthenticatedUserInfo = AuthenticatedUserInfo;
export type MFRAnonymousUserInfo = AnonymousUserInfo;
export type MFRPartialUserInfo = PartialUserInfo;
export type MFRGender = TGender;
export type MFRHistoricalData = THistoricalData<*>;
export type MFRAPIResponseType<T> = APIResponseType<T>;
export type MFRAPIError = APIError;
export type MFRDishRecognitionPredictionType = DishRecognitionPredictionType;
export type MFRDishRecognitionType = DishRecognitionType;
export type MFRDishRecognitionResponseType = DishRecognitionResponseType;
