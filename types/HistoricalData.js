// @flow

type TAttribute = {|
  id: number,
|};

type TExistingHistoricalData<T> = {|
  ...TAttribute,
  ...{| date: Date |},
  ...T,
|};

export type THistoricalData<T> = TExistingHistoricalData<T>;
