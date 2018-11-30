// @flow

import type { TTranslations } from './Translations';

export type TNutrient = {|
  id: number,
  cname: string,
  name_translations: TTranslations,
  unit: string,
  created_at: string,
  updated_at: string,
|};
