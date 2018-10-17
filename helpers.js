// @flow

import type { MFRDishFood } from './V1';

type DishFoodCalculatedInfo = {
  normalized: boolean,
  normalizedQuantity: number,
  eatenQuantity: number,
  eatenUnit: string,
  eatenQuantitySI: number,
  eatenUnitSI: string,
}

const multipliers = {
  f: 10E-15,
  p: 10E-12,
  n: 10E-9,
  µ: 10E-6,
  u: 10E-6,
  m: 10E-3,
  c: 10E-2,
  d: 10E-1,
  da: 10E1,
  h: 10E2,
  k: 10E3,
  M: 10E6,
  G: 10E9,
  T: 10E12,
};

const units = [
  'g', 'l', 'L', 'cal', 'Cal', 'J', 'm',
  'N', 'Å', 'K', '°C', '°F', 'Pa', 'bar',
];

const unitMultiplier = (symbol: string, exponent: number | string = 1) => {
  const res = multipliers[symbol];
  if (!res) throw new Error('Could not convert symbol to multiplier');
  let exp;
  if (typeof exponent === 'number') {
    exp = exponent;
  } else {
    exp = Number(exp);
  }
  switch (exp) {
    case 1: return res;
    case 2: case '²': return res * res;
    case 3: case '³': return res * res * res;
    default: return res ** exp;
  }
};

//  /^(n|µ|u|m|k)?((g|l|L|cal|Cal|J|m|N|Å|K|°C|°F|Pa|bar)(2|²|3|³)?)$/;
const unitre = new RegExp(`^(${Object.keys(multipliers).join('|')})?((${units.join('|')})(\\d|²|³)?)$`);

export const normalizeQuantity = (quantity: number, unit: string) => {
  const matches = unitre.exec(unit);
  if (matches && matches.length) {
    const [, multiplierSymbol, baseUnitExponent, baseUnit, exponent] = matches;
    let multiplier = 1;
    if (multiplierSymbol) {
      multiplier = unitMultiplier(multiplierSymbol, exponent);
    }
    return {
      quantity: quantity * multiplier,
      unit: baseUnitExponent,
      baseUnit,
      exponent,
    };
  }
  throw new Error('Could not normalize quantity');
};

export const calculateDishFoodInfo = (
  dishFood: MFRDishFood,
): DishFoodCalculatedInfo => {
  const {
    food,
    eaten_quantity: eatenQuantity,
    eaten_unit: eatenUnit,
    present_quantity: presentQuantity,
    present_unit: presentUnit,
  } = dishFood;

  let normalized = false;

  let normalizedQuantity = 0;
  if (eatenUnit === '%') {
    if (typeof presentQuantity === 'number'
      && typeof presentUnit === 'string'
      && typeof eatenQuantity === 'number') {
      const eQ = eatenQuantity;
      normalizedQuantity = normalizeQuantity(
        presentQuantity,
        presentUnit,
      ).quantity * eQ / 100;
      normalized = true;
    }
  } else if (typeof eatenQuantity === 'number'
      && typeof eatenUnit === 'string') {
    normalizedQuantity = normalizeQuantity(eatenQuantity, eatenUnit).quantity;
    normalized = true;
  }

  return {
    normalized,
    normalizedQuantity,
  };
};
