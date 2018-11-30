// @flow

import * as CONST from './constants';

type TMediaVariant = {
  name: CONST.TMediaVariantName,
  url: string,
};

export type TMedia = {|
  type: CONST.TMediaType,
  id: number,
  variants: TMediaVariant[],
|};

export type TPostMedia = {|
  type: CONST.TMediaType,
  file: string,
|};
