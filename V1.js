/* @flow */

/*

This is just a draft of what a JavaScript consumption of
MyFoodRepo's API could be

*/

import { HttpError } from 'salathegroup_apis_common/ajaxhelpers';
import GenericAPI from 'salathegroup_apis_common';

import * as DeviceInfo from 'react-native-device-info';

type InstallationInfo = {
  app_version: string,
  device_vendor: string,
  device_name: string,
  os_name: string,
  os_version: string,
};

type AuthenticatedUserInfo = {|
  auth_type: 'email_password',
  id?: number,
  email: string,
  password: string,
  new_password?: string,
  first_name?: string,
  last_name?: string,
  nickname?: string,
  avatar_url?: string,
|};

type AnonymousUserInfo = {|
  auth_type: 'anonymous',
  id?: number,
|};

type UserInfo = AnonymousUserInfo | AuthenticatedUserInfo;

type PartialUserInfo =
  | $Shape<AnonymousUserInfo>
  | $Shape<AuthenticatedUserInfo>;

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
  predictions: [DishRecognitionPredictionType],
  status: string,
};

type DishRecognitionResponseType = {
  recognition: DishRecognitionType,
};

const installation: InstallationInfo = {
  app_version: DeviceInfo.getReadableVersion(),
  device_vendor: DeviceInfo.getManufacturer(),
  device_name: DeviceInfo.getModel(),
  os_name: DeviceInfo.getSystemName(),
  os_version: DeviceInfo.getSystemVersion(),
};

type APIError = {
  type: string,
  code: string,
  message: string,
  reason: string,
};

type ErrorHandler = (error: HttpError) => void;

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
  static defaultHost = 'https://myopenfood-production.herokuapp.com';
  static revision = 'ALPHA';

  uuid: string;
  user: UserInfo;

  constructor(apiKey: string, host: string = '', version: string = '1') {
    super(apiKey, host || MFRAPI.defaultHost, version);
  }

  reportInstallation(uuid: string): Promise<*> {
    this.uuid = uuid;
    return this.requestPatchURL(`installations/${uuid}`, { installation });
  }

  createUser(user: UserInfo): Promise<Object> {
    return this.requestPostURL('users', { user });
  }

  deleteUser(): Promise<Object> {
    return this.requestDeleteURL('users/me');
  }

  getUser(id?: number): Promise<APIResponseType<{ user: UserInfo }>> {
    const user = id || 'me';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}`)
      .then((response: APIResponseType<{ user: UserInfo }>) => {
        this.user = response.data.user;
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  updateUser(user: PartialUserInfo): Promise<Object> {
    const id = user.id || 'me';
    return this.requestPatchURL(`users/${id}`, { user });
  }

  updateUserLogin(user: PartialUserInfo): Promise<Object> {
    const id = user.id || 'me';
    return this.requestPatchURL(`users/${id}/update_email_password`, { user });
  }

  logIn(user: UserInfo): Promise<APIResponseType<LoginResponse>> {
    return new Promise((resolve, reject) => {
      const sessionInfo = {
        user,
        installation: {
          uuid: this.uuid,
        },
      };
      this.requestPostURL('sessions', sessionInfo)
      .then((response: APIResponseType<LoginResponse>) => {
        this.sessionToken = response.data.session_token;
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  logOut(): Promise<APIResponseType<LogoutResponse>> {
    return new Promise((resolve, reject) => {
      this.requestDeleteURL(`sessions/${this.sessionToken}`, {})
      .then(resolve)
      .catch(simplifiedErrorReject(reject));
    });
  }

  recognizeDishImage(
    base64: string,
    mimetype: string = 'image/png',
  ): Promise<Object> {
    const body = {
      image: {
        file: `data:${mimetype};base64,${base64}`,
      },
    };
    return this.requestPostURL('images/recognize', body);
  }
}

export type MFRInstallationInfo = InstallationInfo;
export type MFRUserInfo = UserInfo;
export type MFRAuthenticatedUserInfo = AuthenticatedUserInfo;
export type MFRAnonymousUserInfo = AnonymousUserInfo;
export type MFRPartialUserInfo = PartialUserInfo;
export type MFRAPIResponseType<T> = APIResponseType<T>;
export type MFRAPIError = APIError;
export type MFRDishRecognitionPredictionType = DishRecognitionPredictionType;
export type MFRDishRecognitionType = DishRecognitionType;
export type MFRDishRecognitionResponseType = DishRecognitionResponseType;
