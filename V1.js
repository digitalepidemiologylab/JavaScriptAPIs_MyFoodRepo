/* @flow */

/*

This is just a draft of what a JavaScript consumption of
MyFoodRepo's API could be

*/

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

type PartialUserInfo = ($Shape<AnonymousUserInfo> | $Shape<AuthenticatedUserInfo>) & {
  auth_type?: string,
  new_password?: string,
};

const userInfo: UserInfo = {
  auth_type: 'email_password',
  email: 'boris.conforty3@epfl.ch',
  password: '12345678',
};
if (userInfo);

type APIResponseType<T> = {
  data: T,
  meta: {
    api_version: string,
  },
  status: number,
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

  getUser(id?: number): Promise<Object> {
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

  logIn(user: UserInfo): Promise<Object> {
    return new Promise((resolve, reject) => {
      const sessionInfo = {
        user,
        installation: {
          uuid: this.uuid,
        },
      };
      this.requestPostURL('sessions', sessionInfo)
      .then((response: APIResponseType<{ session_token: string }>) => {
        this.sessionToken = response.data.session_token;
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  logOut(): Promise<Object> {
    return this.requestDeleteURL(`sessions/${this.sessionToken}`, {});
  }

  recognizeDishImage(base64: string, mimetype: string = 'image/png'): Promise<Object> {
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
export type MFRDishRecognitionPredictionType = DishRecognitionPredictionType;
export type MFRDishRecognitionType = DishRecognitionType;
export type MFRDishRecognitionResponseType = DishRecognitionResponseType;
