import test from 'node:test';
import assert from 'node:assert/strict';
import { computeIncomeTax } from './taxCalculator';

test('new regime gives full rebate up to taxable income of 12L', () => {
  const result = computeIncomeTax({
    regime: 'new',
    basicSalary: 1_275_000,
    hraReceived: 0,
    rentPaid: 0,
    isMetroCity: false,
    ltaExemption: 0,
    specialAllowance: 0,
    bonus: 0,
    otherTaxableIncome: 0,
    professionalTax: 0,
    employerNpsContribution: 0,
    deductions: {
      section80C: 0,
      section80CCD1B: 0,
      section80D: 0,
      section80TTA: 0,
      homeLoanInterestSelfOccupied: 0,
    },
  });

  assert.equal(result.taxableIncome, 1_200_000);
  assert.equal(result.taxAfterRebate, 0);
  assert.equal(result.totalTax, 0);
});

test('new regime applies marginal relief immediately after rebate threshold', () => {
  const result = computeIncomeTax({
    regime: 'new',
    basicSalary: 1_275_100,
    hraReceived: 0,
    rentPaid: 0,
    isMetroCity: false,
    ltaExemption: 0,
    specialAllowance: 0,
    bonus: 0,
    otherTaxableIncome: 0,
    professionalTax: 0,
    employerNpsContribution: 0,
    deductions: {
      section80C: 0,
      section80CCD1B: 0,
      section80D: 0,
      section80TTA: 0,
      homeLoanInterestSelfOccupied: 0,
    },
  });

  assert.equal(result.taxableIncome, 1_200_100);
  assert.equal(result.taxAfterRebate, 100);
  assert.equal(result.totalTax, 104);
});

test('old regime HRA and deduction caps are enforced', () => {
  const result = computeIncomeTax({
    regime: 'old',
    basicSalary: 1_200_000,
    hraReceived: 360_000,
    rentPaid: 400_000,
    isMetroCity: true,
    ltaExemption: 60_000,
    specialAllowance: 200_000,
    bonus: 100_000,
    otherTaxableIncome: 0,
    professionalTax: 2_400,
    employerNpsContribution: 200_000,
    deductions: {
      section80C: 200_000,
      section80CCD1B: 80_000,
      section80D: 40_000,
      section80TTA: 30_000,
      homeLoanInterestSelfOccupied: 300_000,
    },
  });

  assert.equal(result.hraExemption, 280_000);
  assert.equal(result.chapterVIAAndOtherDeductions, 555_000);
  assert.equal(result.taxableIncome, 912_600);
  assert.equal(result.totalTax, 98821);
});

test('new regime only allows employer NPS deduction and ignores old-regime deductions', () => {
  const result = computeIncomeTax({
    regime: 'new',
    basicSalary: 1_000_000,
    hraReceived: 300_000,
    rentPaid: 400_000,
    isMetroCity: true,
    ltaExemption: 90_000,
    specialAllowance: 100_000,
    bonus: 0,
    otherTaxableIncome: 0,
    professionalTax: 2_400,
    employerNpsContribution: 300_000,
    deductions: {
      section80C: 150_000,
      section80CCD1B: 50_000,
      section80D: 25_000,
      section80TTA: 10_000,
      homeLoanInterestSelfOccupied: 200_000,
    },
  });

  assert.equal(result.hraExemption, 0);
  assert.equal(result.ltaExemptionAllowed, 0);
  assert.equal(result.professionalTaxAllowed, 0);
  assert.equal(result.chapterVIAAndOtherDeductions, 140_000);
});
