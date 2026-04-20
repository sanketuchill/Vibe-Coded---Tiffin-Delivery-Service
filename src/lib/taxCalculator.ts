export type TaxRegime = 'new' | 'old';

export interface EmployeeTaxInput {
  regime: TaxRegime;
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  isMetroCity: boolean;
  ltaExemption: number;
  specialAllowance: number;
  bonus: number;
  otherTaxableIncome: number;
  professionalTax: number;
  employerNpsContribution: number;
  deductions: {
    section80C: number;
    section80CCD1B: number;
    section80D: number;
    section80TTA: number;
    homeLoanInterestSelfOccupied: number;
  };
}

export interface TaxComputation {
  grossSalary: number;
  hraExemption: number;
  ltaExemptionAllowed: number;
  professionalTaxAllowed: number;
  standardDeduction: number;
  chapterVIAAndOtherDeductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  monthlyTds: number;
  effectiveTaxRate: number;
}

interface Slab {
  upTo: number;
  rate: number;
}

const RUPEE_ROUNDING = 1;

const OLD_SLABS: Slab[] = [
  { upTo: 250_000, rate: 0 },
  { upTo: 500_000, rate: 0.05 },
  { upTo: 1_000_000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

const NEW_SLABS_FY_2026_27: Slab[] = [
  { upTo: 400_000, rate: 0 },
  { upTo: 800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.1 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.2 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

const clampNonNegative = (value: number): number => Math.max(0, Number.isFinite(value) ? value : 0);

const roundRupees = (value: number): number => Math.round(value / RUPEE_ROUNDING) * RUPEE_ROUNDING;

const sanitizeInput = (input: EmployeeTaxInput): EmployeeTaxInput => ({
  ...input,
  basicSalary: clampNonNegative(input.basicSalary),
  hraReceived: clampNonNegative(input.hraReceived),
  rentPaid: clampNonNegative(input.rentPaid),
  ltaExemption: clampNonNegative(input.ltaExemption),
  specialAllowance: clampNonNegative(input.specialAllowance),
  bonus: clampNonNegative(input.bonus),
  otherTaxableIncome: clampNonNegative(input.otherTaxableIncome),
  professionalTax: clampNonNegative(input.professionalTax),
  employerNpsContribution: clampNonNegative(input.employerNpsContribution),
  deductions: {
    section80C: clampNonNegative(input.deductions.section80C),
    section80CCD1B: clampNonNegative(input.deductions.section80CCD1B),
    section80D: clampNonNegative(input.deductions.section80D),
    section80TTA: clampNonNegative(input.deductions.section80TTA),
    homeLoanInterestSelfOccupied: clampNonNegative(input.deductions.homeLoanInterestSelfOccupied),
  },
});

const calculateHraExemption = (input: EmployeeTaxInput): number => {
  if (input.regime !== 'old') {
    return 0;
  }

  const salaryForHra = input.basicSalary;
  const rentMinusTenPercentSalary = Math.max(0, input.rentPaid - 0.1 * salaryForHra);
  const salaryPercentageLimit = salaryForHra * (input.isMetroCity ? 0.5 : 0.4);

  return Math.min(input.hraReceived, rentMinusTenPercentSalary, salaryPercentageLimit);
};

const calculateSlabTax = (taxableIncome: number, slabs: Slab[]): number => {
  let tax = 0;
  let previousUpperLimit = 0;

  for (const slab of slabs) {
    if (taxableIncome <= previousUpperLimit) {
      break;
    }

    const taxableInThisSlab = Math.min(taxableIncome, slab.upTo) - previousUpperLimit;
    if (taxableInThisSlab > 0) {
      tax += taxableInThisSlab * slab.rate;
    }

    previousUpperLimit = slab.upTo;
  }

  return tax;
};

const calculateStandardDeduction = (regime: TaxRegime): number => (regime === 'new' ? 75_000 : 50_000);

const calculateAllowedDeductions = (input: EmployeeTaxInput): number => {
  const employerNpsCap = input.basicSalary * (input.regime === 'new' ? 0.14 : 0.1);
  const employerNpsDeduction = Math.min(input.employerNpsContribution, employerNpsCap);

  if (input.regime === 'new') {
    return employerNpsDeduction;
  }

  const section80C = Math.min(input.deductions.section80C, 150_000);
  const section80CCD1B = Math.min(input.deductions.section80CCD1B, 50_000);
  const section80D = Math.min(input.deductions.section80D, 25_000);
  const section80TTA = Math.min(input.deductions.section80TTA, 10_000);
  const homeLoan = Math.min(input.deductions.homeLoanInterestSelfOccupied, 200_000);

  return section80C + section80CCD1B + section80D + section80TTA + homeLoan + employerNpsDeduction;
};

const getSlabs = (regime: TaxRegime): Slab[] => (regime === 'new' ? NEW_SLABS_FY_2026_27 : OLD_SLABS);

const calculateRawTaxBeforeSurcharge = (regime: TaxRegime, taxableIncome: number): number => {
  const slabTax = calculateSlabTax(taxableIncome, getSlabs(regime));
  const rebate = calculateRebate(regime, taxableIncome, slabTax).rebate;
  return Math.max(0, slabTax - rebate);
};

const calculateRebate = (
  regime: TaxRegime,
  taxableIncome: number,
  slabTax: number,
): { rebate: number; taxAfterRebate: number } => {
  if (regime === 'old') {
    if (taxableIncome <= 500_000) {
      const rebate = Math.min(slabTax, 12_500);
      return { rebate, taxAfterRebate: slabTax - rebate };
    }

    return { rebate: 0, taxAfterRebate: slabTax };
  }

  if (taxableIncome <= 1_200_000) {
    const rebate = Math.min(slabTax, 60_000);
    return { rebate, taxAfterRebate: slabTax - rebate };
  }

  const marginalReliefCap = taxableIncome - 1_200_000;
  const taxAfterRebate = Math.min(slabTax, marginalReliefCap);
  const rebate = Math.max(0, slabTax - taxAfterRebate);

  return { rebate, taxAfterRebate };
};

const getSurchargeRate = (regime: TaxRegime, taxableIncome: number): number => {
  if (taxableIncome <= 5_000_000) return 0;
  if (taxableIncome <= 10_000_000) return 0.1;
  if (taxableIncome <= 20_000_000) return 0.15;
  if (taxableIncome <= 50_000_000) return 0.25;
  return regime === 'old' ? 0.37 : 0.25;
};

const calculateTaxWithSurchargeNoRelief = (regime: TaxRegime, taxableIncome: number): number => {
  const taxBeforeSurcharge = calculateRawTaxBeforeSurcharge(regime, taxableIncome);
  const surchargeRate = getSurchargeRate(regime, taxableIncome);
  return taxBeforeSurcharge * (1 + surchargeRate);
};

const applySurchargeWithMarginalRelief = (
  regime: TaxRegime,
  taxableIncome: number,
  taxAfterRebate: number,
): number => {
  const surchargeRate = getSurchargeRate(regime, taxableIncome);
  if (surchargeRate === 0) {
    return 0;
  }

  const thresholds = [5_000_000, 10_000_000, 20_000_000, 50_000_000].filter((value) => taxableIncome > value);
  const crossedThreshold = thresholds[thresholds.length - 1];

  const surchargeWithoutRelief = taxAfterRebate * surchargeRate;
  const totalWithoutRelief = taxAfterRebate + surchargeWithoutRelief;

  const taxAtThreshold = calculateTaxWithSurchargeNoRelief(regime, crossedThreshold);
  const maxTaxWithRelief = taxAtThreshold + (taxableIncome - crossedThreshold);
  const taxAfterRelief = Math.min(totalWithoutRelief, maxTaxWithRelief);

  return Math.max(0, taxAfterRelief - taxAfterRebate);
};

export const computeIncomeTax = (inputPayload: EmployeeTaxInput): TaxComputation => {
  const input = sanitizeInput(inputPayload);

  const grossSalary = input.basicSalary + input.hraReceived + input.specialAllowance + input.bonus;
  const hraExemption = calculateHraExemption(input);
  const ltaExemptionAllowed = input.regime === 'old' ? input.ltaExemption : 0;
  const professionalTaxAllowed = input.regime === 'old' ? input.professionalTax : 0;
  const standardDeduction = calculateStandardDeduction(input.regime);
  const chapterVIAAndOtherDeductions = calculateAllowedDeductions(input);

  const taxableSalary = Math.max(0, grossSalary - hraExemption - ltaExemptionAllowed - professionalTaxAllowed);
  const taxableIncome = Math.max(
    0,
    taxableSalary + input.otherTaxableIncome - standardDeduction - chapterVIAAndOtherDeductions,
  );

  const slabTax = calculateSlabTax(taxableIncome, getSlabs(input.regime));
  const { rebate, taxAfterRebate } = calculateRebate(input.regime, taxableIncome, slabTax);
  const surcharge = applySurchargeWithMarginalRelief(input.regime, taxableIncome, taxAfterRebate);
  const cess = (taxAfterRebate + surcharge) * 0.04;
  const totalTax = taxAfterRebate + surcharge + cess;

  return {
    grossSalary: roundRupees(grossSalary),
    hraExemption: roundRupees(hraExemption),
    ltaExemptionAllowed: roundRupees(ltaExemptionAllowed),
    professionalTaxAllowed: roundRupees(professionalTaxAllowed),
    standardDeduction: roundRupees(standardDeduction),
    chapterVIAAndOtherDeductions: roundRupees(chapterVIAAndOtherDeductions),
    taxableIncome: roundRupees(taxableIncome),
    slabTax: roundRupees(slabTax),
    rebate: roundRupees(rebate),
    taxAfterRebate: roundRupees(taxAfterRebate),
    surcharge: roundRupees(surcharge),
    cess: roundRupees(cess),
    totalTax: roundRupees(totalTax),
    monthlyTds: roundRupees(totalTax / 12),
    effectiveTaxRate: taxableIncome === 0 ? 0 : Number(((totalTax / taxableIncome) * 100).toFixed(2)),
  };
};

export const formatInr = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
