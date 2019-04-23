// @flow

import type { TTranslations } from './Translations';

export type TSubject = {|
  id: number,
  user_id: number,
  user_attached: boolean,
  user_key: string,
  expiration_at: ?string,
  study_name_translations: TTranslations,
  study_logo_uri: ?string,
  cohort_name_translations: TTranslations,
  cohort_logo_uri: ?string,
  created_at: string,
  updated_at: string,
  expired_at: ?string,
|};
