/* @flow */

/*

This is just a draft of what a JavaScript consumption of
MyOpenFood's API could be

*/

import { GenericAPI } from 'salathegroup_apis_common';

import DeviceInfo from 'react-native-device-info';

type InstallationInfo = {
  app_version: string,
  device_vendor: string,
  device_name: string,
  os_name: string,
  os_version: string,
}

type UserInfo = {
  id?: number,
  auth_type?: 'email_password' | 'anonymous',
  email?: string,
  password?: string,
  new_password?: string,
  first_name?: string,
  last_name?: string,
  nickname?: string,
  avatar_url?: string,
}

type APIResponseType<T> = {
  data: T,
  meta: {
    api_version: string,
  },
  status: number,
}

const installation: InstallationInfo = {
  app_version: DeviceInfo.getReadableVersion(),
  device_vendor: DeviceInfo.getManufacturer(),
  device_name: DeviceInfo.getModel(),
  os_name: DeviceInfo.getSystemName(),
  os_version: DeviceInfo.getSystemVersion(),
};

export default class MOFAPI extends GenericAPI {

  static defaultHost = 'https://myopenfood-production.herokuapp.com';
  static revision = 'ALPHA';

  uuid: string;
  user: MOFUserInfo;

  constructor(apiKey: string, host: string = '', version: string = '1') {
    super(apiKey, host || MOFAPI.defaultHost, version);
  }

  reportInstallation(uuid: string): Promise<> {
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
      .then((response) => {
        this.user = response.data.user;
        resolve(response);
      })
      .catch(error => reject(error));
    });
  }

  updateUser(user: UserInfo): Promise<Object> {
    const id = user.id || 'me';
    return this.requestPatchURL(`users/${id}`, { user });
  }

  updateUserLogin(user: UserInfo): Promise<Object> {
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
      .then((response) => {
        this.sessionToken = response.data.session_token;
        resolve(response);
      })
      .catch(error => reject(error));
    });
  }

  logOut(): Promise<Object> {
    return this.requestDeleteURL(`sessions/${this.sessionToken}`, {});
  }
}

export type MOFInstallationInfo = InstallationInfo;
export type MOFUserInfo = UserInfo;
export type MOFAPIResponseType<T> = APIResponseType<T>;
export type MOFDishRecognitionPredictionType = DishRecognitionPredictionType;
export type MOFDishRecognitionType = DishRecognitionType;
export type MOFDishRecognitionResponseType = DishRecognitionResponseType;
