/* @flow */

/*

This is just a draft of what a JavaScript consumption of
MyOpenFood's API could be

*/

import { GenericAPI } from 'salathegroup_apis_common';

import DeviceInfo from 'react-native-device-info';

export type MyOpenFoodInstallationInfo = {
  app_version: string,
  device_vendor: string,
  device_name: string,
  os_name: string,
  os_version: string,
}

export type MyOpenFoodUserInfo = {
  id?: number,
  auth_type: 'email_password' | 'anonymous',
  email?: string,
  password?: string,
  new_password?: string,
  first_name?: string,
  last_name?: string,
  nickname?: string,
  avatar_url?: string,
}

const installation: MyOpenFoodInstallationInfo = {
  app_version: DeviceInfo.getReadableVersion(),
  device_vendor: DeviceInfo.getManufacturer(),
  device_name: DeviceInfo.getModel(),
  os_name: DeviceInfo.getSystemName(),
  os_version: DeviceInfo.getSystemVersion(),
};

export default class MyOpenFoodAPI extends GenericAPI {

  static defaultHost = 'https://myopenfood-production.herokuapp.com';
  static revision = 'ALPHA';

  uuid: string;
  user: MyOpenFoodUserInfo;

  constructor(apiKey: string, host: string = '', version: string = '1') {
    super(apiKey, host || MyOpenFoodAPI.defaultHost, version);
  }

  reportInstallation(uuid: string): Promise<> {
    this.uuid = uuid;
    return this.requestPatchURL(`installations/${uuid}`, { installation });
  }

  createUser(user: MyOpenFoodUserInfo): Promise<Object> {
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

  updateUser(user: MyOpenFoodUserInfo): Promise<Object> {
    const id = user.id || 'me';
    return this.requestPatchURL(`users/${id}`, { user });
  }

  updateUserLogin(user: MyOpenFoodUserInfo): Promise<Object> {
    const id = user.id || 'me';
    return this.requestPatchURL(`users/${id}/update_email_password`, { user });
  }

  logIn(user: MyOpenFoodUserInfo): Promise<Object> {
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
