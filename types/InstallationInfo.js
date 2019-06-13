// @flow

export type TInstallationExtraInfo = { [string]: string };

export type TInstallationInfo<T: TInstallationExtraInfo> = {|
  ...T,
  app_version: string,
  device_vendor: string,
  device_name: string,
  os_name: string,
  os_version: string,
|};
