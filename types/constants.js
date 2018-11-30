// @flow

export type TEnvironmentStaging = 'staging';
export type TEnvironmentProduction = 'production';
export type TEnvironment = TEnvironmentStaging | TEnvironmentProduction;

export type TCountry = 'CH';

export type TMale = 'male';
export type TFemale = 'female';
export type TGender = TMale | TFemale;

export type TAuthTypeEmailPassword = 'email_password';
export type TAuthTypeAnonymous = 'anonymous';
export type TAuthType = TAuthTypeEmailPassword | TAuthTypeAnonymous;

// TODO: find out all of them
export type TDishRecognitionStatus = 'MYFOODREPO.IMAGE_PROCESSED' | string;

export type TMediaVariantNameOriginal = 'original';
export type TMediaVariantNameThumb = 'thumb';
export type TMediaVariantName =
  | TMediaVariantNameOriginal
  | TMediaVariantNameThumb;

export type TMediaType = 'ImageMedia';
export type TLanguage = 'fr' | 'de' | 'it' | 'en';
export type TFoodUnit = 'g' | 'ml';

export type TFoodImageCategory =
  | 'Nutrients table'
  | 'Back'
  | 'Ingredients list'
  | 'Front';

export type TFoodTypeFoodRepo = 'FoodRepoFood';
export type TFoodType = TFoodTypeFoodRepo;

export type TDishStatusPendingClassification = 'pending_classification';
export type TDishStatusPendingUserResponse = 'pending_user_response';
export type TDishStatusOk = 'ok';
export type TDishStatus =
  | TDishStatusPendingClassification
  | TDishStatusPendingUserResponse
  | TDishStatusOk;

// eslint-disable-next-line import/prefer-default-export
export const CategoryNutrients = new Map<string, Set<string>>([
  ['energy', new Set(['energy_kcal', 'energy_kj'])],
  ['carbohydrates', new Set(['carbohydrates', 'fiber', 'starch', 'sugar'])],
  [
    'fat',
    new Set([
      'cholesterol',
      'fat',
      'fatty_acids_monounsaturated',
      'fatty_acids_polyunsaturated',
      'fatty_acids_saturated',
    ]),
  ],
  ['protein', new Set(['protein'])],
  [
    'minerals',
    new Set([
      'calcium',
      'chloride',
      'iodide',
      'iron',
      'magnesium',
      'phosphorus',
      'potassium',
      'sodium',
      'zinc',
    ]),
  ],
  ['water', new Set(['water'])],
  ['alcohol', new Set(['alcohol'])],
  [
    'vitamins',
    new Set([
      'all_trans_retinol_equivalents_activity',
      'beta_carotene',
      'beta_carotene_activity',
      'folate',
      'niacin',
      'pantothenic_acid',
      'vitamin_a_activity',
      'vitamin_b1',
      'vitamin_b2',
      'vitamin_b6',
      'vitamin_b12',
      'vitamin_c',
      'vitamin_d',
      'vitamin_e_activity',
    ]),
  ],
]);

const nc = {};
// eslint-disable-next-line no-restricted-syntax
for (const cn of CategoryNutrients) {
  const [name, value] = cn;
  const nutrients = value.values();
  let nutrient = nutrients.next();
  while (!nutrient.done) {
    nc[nutrient.value] = name;
    nutrient = nutrients.next();
  }
}

export const NutrientCategories = nc;
