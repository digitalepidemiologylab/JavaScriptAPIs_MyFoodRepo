// @flow

import * as CONST from './constants';

export type TMessage = {
  type: string,
  message: string,
};

export type TResponseType<T> = {
  data: T,
  meta: {
    api_version: string,
    env: CONST.TEnvironment,
    server_time: string,
    locale: string,
  },
  info?: {
    messages?: TMessage[],
  },
  status: number,
};

export type TError = {
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
