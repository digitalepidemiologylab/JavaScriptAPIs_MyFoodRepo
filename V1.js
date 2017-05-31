/* @flow */

/*

This is just a draft of what a JavaScript consumption of
MyOpenFood's API could be

*/

import GenericAPI from '../../SalatheGroupAPI/GenericAPI';

const DeviceInfo = require('react-native-device-info');

export type MyOpenFoodInstallationInfo = {
  app_version: string,
  device_vendor: string,
  device_name: string,
  os_name: string,
  os_version: string,
}

export type MyOpenFoodUserInfo = {
    auth_type: 'email_password' | 'facebook' | 'anonymous',
    email?: string,
    password?: string,
    facebookUserID?: string,
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

  getUser(): Promise<Object> {
    return this.requestGetURL('users/me');
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
