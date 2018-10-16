/* @flow */

/*

This is just a draft of what a JavaScript consumption of
MyFoodRepo's API could be

*/

import { HttpError } from 'salathegroup_apis_common/src/ajax-helpers';
import GenericAPI, { type TCompressionType } from 'salathegroup_apis_common';

import DeviceInfo from 'react-native-device-info';

type InstallationInfo = {
  app_version: string,
  device_vendor: string,
  device_name: string,
  os_name: string,
  os_version: string,
};

type TAttribute = {|
  id: number,
|};

/*
type TAttributeDestroy = {|
  ...TAttribute,
  ...{| _destroy: boolean |},
|};

type TNewHistoricalData<T> = {|
  ...{| date: Date |},
  ...T,
|};
*/

type TExistingHistoricalData<T> = {|
  ...TAttribute,
  ...{| date: Date |},
  ...T,
|};

type THistoricalData<T> =
  // | TNewHistoricalData<T>
  TExistingHistoricalData<T>;
// | TAttributeDestroy;

type TGender = 'male' | 'female';

type TWeightData = THistoricalData<{| weight: number |}>;

type CommonUserInfo = {|
  id?: number,
  first_name?: string,
  last_name?: string,
  nickname?: string,
  avatar_url?: string,
  weights?: Array<TWeightData>,
  height?: number,
  sex?: TGender,
  date_of_birth?: Date,
|};

type AuthenticatedLoginInfo = {|
  auth_type: 'email_password',
  email: string,
  password: string,
  new_password?: string,
|};

type AnonymousLoginInfo = {|
  auth_type: 'anonymous',
|};

type AuthenticatedUserInfo = {|
  ...AuthenticatedLoginInfo,
  ...CommonUserInfo,
|};

type AnonymousUserInfo = {|
  ...AnonymousLoginInfo,
  ...CommonUserInfo,
|};

type UserInfo = AnonymousUserInfo | AuthenticatedUserInfo;

type PartialUserInfo =
  | $Shape<AnonymousLoginInfo>
  | $Shape<AuthenticatedLoginInfo>
  | $Shape<CommonUserInfo>;

type APIResponseType<T> = {
  data: T,
  meta: {
    api_version: string,
  },
  status: number,
};

type LoginResponse = {
  session_token: string,
};

type LogoutResponse = {
  session_token: string,
};

type DishRecognitionPredictionType = {
  class: string,
  confidence: number,
};

type DishRecognitionType = {
  ml_api_version: string,
  image_recognition_id: string,
  image_url: string,
  predictions: Array<DishRecognitionPredictionType>,
  status: string,
};

type DishRecognitionResponseType = {
  recognition: DishRecognitionType,
};

let installation: InstallationInfo;

type APIError = {
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

type ErrorHandler = (error: HttpError) => void;

type DishComment = {
  id: number,
  user: {
    id: number,
    display_name: string,
    avatar_url: string,
  },
  message: string,
  created_at: Date,
  updated_at: Date,
};

type MediaVariant = {
  name: 'original' | 'thumb',
  url: string,
};

type PostMedia = {
  type: 'ImageMedia',
  file: string,
};

type Country = 'CH';

type PostDishFoodFood = {
  _type: 'barcode',
  country: Country,
  barcode: string,
};

type PostDishFood = {
  food: PostDishFoodFood,
};

type PostDish = {
  id: number,
  submitting?: boolean,
  name?: string,
  note?: string,
  eaten_at: string,
  eaten_at_utc_offset: number,
  media?: PostMedia[],
  dish_foods?: PostDishFood[],
};

type Media = {
  type: 'ImageMedia',
  id: number,
  variants: MediaVariant[],
};

type Language = 'fr' | 'de' | 'it' | 'en';

type Translations = {
  [key: Language]: string,
};

type FoodUnit = 'g' | 'ml';

type FoodImageCategory =
  | 'Nutrients table'
  | 'Back'
  | 'Ingredients list'
  | 'Front';

type URL = string;

type FoodImage = {
  categories: FoodImageCategory[],
  thumb: URL,
  medium: URL,
  large: URL,
  xlarge: URL,
};

type Nutrient = {
  id: number,
  cname: string,
  name_translations: Translations,
  unit: string,
  created_at: string,
  updated_at: string,
}

const CategoryNutrients = new Map<string, Set<string>>([
  ['energy', new Set(['energy_kcal', 'energy_kj'])],
  ['carbohydrates', new Set([
    'carbohydrates',
    'fiber',
    'starch',
    'sugar',
  ])],
  ['fat', new Set([
    'cholesterol',
    'fat',
    'fatty_acids_monounsaturated',
    'fatty_acids_polyunsaturated',
    'fatty_acids_saturated',
  ])],
  ['protein', new Set(['protein'])],
  ['minerals', new Set([
    'calcium',
    'chloride',
    'iodide',
    'iron',
    'magnesium',
    'phosphorus',
    'potassium',
    'sodium',
    'zinc',
  ])],
  ['water', new Set(['water'])],
  ['alcohol', new Set(['alcohol'])],
  ['vitamins', new Set([
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
  ])],
]);

const NutrientCategories = {};
// eslint-disable-next-line no-restricted-syntax
for (const cn of CategoryNutrients) {
  const [name, value] = cn;
  const nutrients = value.values();
  let nutrient = nutrients.next();
  while (!nutrient.done) {
    NutrientCategories[nutrient.value] = name;
    nutrient = nutrients.next();
  }
}

type FoodNutrient = {
  id: number,
  per_hundred: number,
  nutrient: Nutrient;
};

type Food = {
  id: number,
  type: 'FoodRepoFood',
  country: Country,
  barcode: string,
  name_translations: Translations,
  unit: FoodUnit,
  images: FoodImage[],
  food_nutrients: FoodNutrient[],
  country: Country,
};

type DishFood = {
  id: number,
  food: Food,
  present_quantity: ?number,
  present_unit: ?string,
  eaten_quantity: ?number,
  eaten_unit: ?string,
};

type Dish = {
  id: number,
  _destroyed?: boolean, // eslint-disable-line no-underscore-dangle
  user_id: number,
  name: string,
  note: string,
  status: string,
  eaten_at: Date,
  eaten_at_utc_offset: number,
  media?: Media[],
  dish_foods?: DishFood[],
  comments: DishComment[],
  created_at: string,
  updated_at: string,
};

type Dishes = Dish[];

type Subject = {
  id: number,
  user_id: number,
  user_attached: boolean,
  user_key: string,
  expiration_at: ?string,
  study_name_translations: Translations,
  study_logo_uri: ?string,
  cohort_name_translations: Translations,
  cohort_logo_uri: ?string,
  created_at: string,
  updated_at: string,
};

type Subjects = Subject[];

function simplifiedErrorReject(reject: (error: Object) => void): ErrorHandler {
  return function errorHandler(error: HttpError) {
    try {
      const response: { error: APIError } = JSON.parse(
        error.request.responseText,
      );
      reject(response.error);
    } catch (e) {
      reject(error);
    }
  };
}

export default class MFRAPI extends GenericAPI {
  static defaultHost = 'https://www.myfoodrepo.org';

  static revision = 'ALPHA';

  static defaultRecognitionInputSize = {
    width: 256,
    height: 256,
  };

  uuid: string;

  user: UserInfo;

  constructor(
    apiKey: string,
    host: string = '',
    version: string = '1',
    compress: TCompressionType = 'auto',
  ) {
    super(apiKey, host || MFRAPI.defaultHost, version, compress);
  }

  reportInstallation(uuid: string, timeout: number = 0): Promise<*> {
    this.uuid = uuid;
    if (!installation) {
      installation = {
        app_version: DeviceInfo.getReadableVersion(),
        device_vendor: DeviceInfo.getManufacturer(),
        device_name: DeviceInfo.getModel(),
        os_name: DeviceInfo.getSystemName(),
        os_version: DeviceInfo.getSystemVersion(),
      };
    }
    return this.requestPatchURL(
      `installations/${uuid}`,
      { installation },
      timeout,
    );
  }

  createUser(user: UserInfo, timeout: number = 0): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.requestPostURL('users', { user }, timeout)
      .then((response: APIResponseType<LoginResponse>) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  deleteUser(timeout: number = 0): Promise<Object> {
    return this.requestDeleteURL('users/me', null, timeout);
  }

  getUser(
    id?: number,
    timeout: number = 0,
  ): Promise<APIResponseType<{ user: UserInfo }>> {
    const user = id || 'me';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}`, timeout)
      .then((response: APIResponseType<{ user: UserInfo }>) => {
        // this.user = response.data.user;
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  updateUser(user: PartialUserInfo, timeout: number = 0): Promise<Object> {
    const id: string = typeof user.id === 'number' ? `${user.id}` : 'me';
    return this.requestPatchURL(`users/${id}`, { user }, timeout);
  }

  updateUserLogin(user: PartialUserInfo, timeout: number = 0): Promise<Object> {
    const id = typeof user.id === 'number' ? user.id : 'me';
    return this.requestPatchURL(
      `users/${id}/update_email_password`,
      { user },
      timeout,
    );
  }

  logIn(
    user: UserInfo,
    timeout: number = 0,
  ): Promise<APIResponseType<LoginResponse>> {
    return new Promise((resolve, reject) => {
      const sessionInfo = {
        user,
        installation: {
          uuid: this.uuid,
        },
      };
      this.requestPostURL('sessions', sessionInfo, timeout)
      .then((response: APIResponseType<LoginResponse>) => {
        this.sessionToken = response.data.session_token;
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  logOut(timeout: number = 0): Promise<APIResponseType<LogoutResponse>> {
    return new Promise((resolve, reject) => {
      if (this.sessionToken) {
        this.requestDeleteURL(`sessions/${this.sessionToken}`, {}, timeout)
        .then(resolve)
        .catch(simplifiedErrorReject(reject));
      } else {
        reject(new Error('No session token, logout impossible'));
      }
    });
  }

  recognizeDishImage(
    base64: string,
    mimetype: ?string,
    timeout: number = 0,
  ): Promise<Object> {
    const uri = `data:${mimetype || 'image/png'};base64,${base64}`;
    return this.recognizeDishImageURI(uri, timeout);
  }

  recognizeDishImageURI(uri: string, timeout: number = 0): Promise<Object> {
    const body = {
      image: {
        file: uri,
      },
    };
    return this.requestPostURL('images/recognize', body, timeout);
  }

  getDishes(
    userId: ?number,
    lastSync: ?(Date | string),
    timeout: number = 0,
    sort: string = 'eaten_at desc',
  ): Promise<APIResponseType<{ dishes: Dishes }>> {
    const user = userId || 'me';
    const params = [];
    if (typeof lastSync === 'string') {
      params.push(`last_sync_at=${lastSync}`);
    } else if (lastSync instanceof Date) {
      params.push(`last_sync_at=${lastSync.toISOString()}`);
    }
    if (sort) {
      params.push(`${('q[sorts]')}=${sort.replace(' ', '+')}`);
    }
    const paramsStr = params.length > 0 ? `?${params.join('&')}` : '';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}/dishes${paramsStr}`, timeout)
      .then((response: APIResponseType<{ dishes: Dishes }>) => {
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  addDish(
    userId: ?number,
    dish: PostDish,
    timeout: number = 0,
  ): Promise<APIResponseType<{ dish: Dish }>> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      this.requestPostURL(`users/${user}/dishes`, { dish }, timeout)
      .then((response: APIResponseType<{ dish: Dish }>) => {
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  removeDish(
    userId: ?number,
    dishId: number,
    timeout: number = 0,
  ): Promise<APIResponseType<{ dish: Dish }>> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      this.requestDeleteURL(`users/${user}/dishes/${dishId}`, null, timeout)
      .then((response: APIResponseType<{ dish: Dish }>) => {
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  duplicateDish(
    userId: ?number,
    dish: PostDish,
    timeout: number = 0,
  ): Promise<APIResponseType<{ dish: Dish }>> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      this.requestPostURL(
        `users/${user}/dishes/${dish.id}/duplicate`,
        { dish: { ...dish, id: undefined } },
        timeout,
      )
      .then((response: APIResponseType<{ dish: Dish }>) => {
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  updateDish(dish: $Shape<Dish>, timeout: number = 0): Promise<Object> {
    return this.requestPatchURL(
      `dishes/${dish.id}`,
      { dish: { ...dish, id: undefined } },
      timeout,
    );
  }

  getSubjects(
    userId?: ?number,
    timeout: number = 0,
  ): Promise<APIResponseType<{ subjects: Subjects }>> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      this.requestGetURL(`users/${user}/subjects`, timeout)
      .then((response: APIResponseType<{ subjects: Subjects }>) => {
        resolve(response);
      })
      .catch((error: Error) => reject(error));
    });
  }

  addSubject(
    subjectKey: string,
    userId?: ?number,
    timeout: number = 0,
  ): Promise<APIResponseType<{ subjects: Subjects }>> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      const info = {
        subject: {
          key: subjectKey,
        },
      };
      this.requestPostURL(`users/${user}/subjects`, info, timeout)
      .then((response: APIResponseType<{ subjects: Subjects }>) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  removeSubject(
    subjectId: number,
    userId?: ?number,
    timeout: number = 0,
  ): Promise<APIResponseType<{ subjects: Subjects }>> {
    const user = userId || 'me';
    return new Promise((resolve, reject) => {
      this.requestDeleteURL(
        `users/${user}/subjects/${subjectId}`,
        null,
        timeout,
      )
      .then((response: APIResponseType<{ subjects: Subjects }>) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }

  nutrients(
    timeout: number = 0,
  ): Promise<APIResponseType<{ nutrients: Nutrient[] }>> {
    return new Promise((resolve, reject) => {
      this.requestGetURL('nutrients', timeout)
      .then((response: APIResponseType<{ nutrients: Nutrient[] }>) => {
        resolve(response);
      })
      .catch(simplifiedErrorReject(reject));
    });
  }
}

export const MFRNutrientCategories = NutrientCategories;
export const MFRCategoryNutrients = CategoryNutrients;

export type MFRInstallationInfo = InstallationInfo;
export type MFRUserInfo = UserInfo;
export type MFRDish = Dish;
export type MFRPostDish = PostDish;
export type MFRDishes = Dishes;
export type MFRDishComment = DishComment;
export type MFRAuthenticatedLoginInfo = AuthenticatedLoginInfo;
export type MFRAnonymousLoginInfo = AnonymousLoginInfo;
export type MFRAuthenticatedUserInfo = AuthenticatedUserInfo;
export type MFRAnonymousUserInfo = AnonymousUserInfo;
export type MFRPartialUserInfo = PartialUserInfo;
export type MFRGender = TGender;
export type MFRSubject = Subject;
export type MFRHistoricalData = THistoricalData<*>;
export type MFRAPIResponseType<T> = APIResponseType<T>;
export type MFRAPIError = APIError;
export type MFRDishRecognitionPredictionType = DishRecognitionPredictionType;
export type MFRDishRecognitionType = DishRecognitionType;
export type MFRDishRecognitionResponseType = DishRecognitionResponseType;
