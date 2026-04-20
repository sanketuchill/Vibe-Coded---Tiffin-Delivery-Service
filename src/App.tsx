import { useMemo, useState } from 'react';
import { BarChart3, Calculator, CircleDollarSign, Landmark, ShieldCheck } from 'lucide-react';
import { computeIncomeTax, formatInr, type EmployeeTaxInput, type TaxRegime } from './lib/taxCalculator';

const INITIAL_INPUT: EmployeeTaxInput = {
  regime: 'new',
  basicSalary: 1_200_000,
  hraReceived: 240_000,
  rentPaid: 300_000,
  isMetroCity: true,
  ltaExemption: 50_000,
  specialAllowance: 180_000,
  bonus: 120_000,
  otherTaxableIncome: 30_000,
  professionalTax: 2_400,
  employerNpsContribution: 90_000,
  deductions: {
    section80C: 150_000,
    section80CCD1B: 50_000,
    section80D: 25_000,
    section80TTA: 10_000,
    homeLoanInterestSelfOccupied: 120_000,
  },
};

const TAX_CHANGE_POINTS = [
  'FY 2026-27 new regime slab rates (0–4L nil to 24L+ @ 30%)',
  'Standard deduction support: ₹75,000 (new) and ₹50,000 (old)',
  'Section 87A rebate logic with marginal relief in new regime',
  'Surcharge + marginal relief and 4% health & education cess',
  'Employee payroll-focused exemptions and deduction controls by regime',
];

const fieldGroup = 'bg-slate-900/60 border border-slate-700 rounded-2xl p-4 space-y-4';

const numericInput = (
  label: string,
  value: number,
  onChange: (value: number) => void,
  helper?: string,
) => (
  <label className="block space-y-2">
    <span className="text-sm text-slate-200 font-medium">{label}</span>
    <input
      type="number"
      min={0}
      value={value}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
    />
    {helper ? <span className="text-xs text-slate-400">{helper}</span> : null}
  </label>
);

export default function App() {
  const [inputs, setInputs] = useState<EmployeeTaxInput>(INITIAL_INPUT);

  const update = <K extends keyof EmployeeTaxInput>(key: K, value: EmployeeTaxInput[K]) => {
    setInputs((previous) => ({ ...previous, [key]: value }));
  };

  const updateDeduction = <K extends keyof EmployeeTaxInput['deductions']>(
    key: K,
    value: EmployeeTaxInput['deductions'][K],
  ) => {
    setInputs((previous) => ({
      ...previous,
      deductions: {
        ...previous.deductions,
        [key]: value,
      },
    }));
  };

  const result = useMemo(() => computeIncomeTax(inputs), [inputs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <header className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Landmark size={14} /> India Payroll Intelligence Suite
              </p>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Income Tax Calculator FY 2026-27</h1>
              <p className="max-w-3xl text-sm text-slate-300 md:text-base">
                Advanced employee-tax engine with old/new regime comparison-ready logic, rebate handling,
                surcharge marginal relief, and payroll-grade monthly TDS output.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Annual Tax Payable</p>
              <p className="text-2xl font-extrabold text-cyan-300 md:text-3xl">{formatInr(result.totalTax)}</p>
              <p className="text-xs text-slate-400">Monthly TDS: {formatInr(result.monthlyTds)}</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr,1fr]">
          <div className="space-y-6">
            <div className={fieldGroup}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-300">
                <Calculator size={18} /> Salary & Regime Inputs
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm text-slate-200 font-medium">Tax regime</span>
                  <select
                    value={inputs.regime}
                    onChange={(event) => update('regime', event.target.value as TaxRegime)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="new">New regime (default)</option>
                    <option value="old">Old regime</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={inputs.isMetroCity}
                    onChange={(event) => update('isMetroCity', event.target.checked)}
                    className="h-4 w-4 accent-cyan-500"
                  />
                  <span className="text-sm text-slate-200">Metro city for HRA (old regime)</span>
                </label>
                {numericInput('Basic salary (annual)', inputs.basicSalary, (value) => update('basicSalary', value))}
                {numericInput('HRA received', inputs.hraReceived, (value) => update('hraReceived', value))}
                {numericInput('Annual rent paid', inputs.rentPaid, (value) => update('rentPaid', value), 'Used for HRA exemption in old regime')}
                {numericInput('Special allowance', inputs.specialAllowance, (value) => update('specialAllowance', value))}
                {numericInput('Bonus / variable pay', inputs.bonus, (value) => update('bonus', value))}
                {numericInput('Other taxable income', inputs.otherTaxableIncome, (value) => update('otherTaxableIncome', value))}
                {numericInput('LTA exemption claim', inputs.ltaExemption, (value) => update('ltaExemption', value), 'Old regime only')}
                {numericInput('Professional tax', inputs.professionalTax, (value) => update('professionalTax', value), 'Old regime deduction')}
                {numericInput('Employer NPS contribution', inputs.employerNpsContribution, (value) => update('employerNpsContribution', value), 'Capped by regime salary percentage')}
              </div>
            </div>

            <div className={fieldGroup}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-300">
                <ShieldCheck size={18} /> Deductions & Exemptions
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {numericInput('Section 80C', inputs.deductions.section80C, (value) => updateDeduction('section80C', value), 'Cap: ₹1,50,000 (old regime)')}
                {numericInput('Section 80CCD(1B)', inputs.deductions.section80CCD1B, (value) => updateDeduction('section80CCD1B', value), 'Cap: ₹50,000 (old regime)')}
                {numericInput('Section 80D', inputs.deductions.section80D, (value) => updateDeduction('section80D', value), 'Cap: ₹25,000 (old regime default)')}
                {numericInput('Section 80TTA', inputs.deductions.section80TTA, (value) => updateDeduction('section80TTA', value), 'Cap: ₹10,000 (old regime)')}
                {numericInput('Home loan interest (self-occupied)', inputs.deductions.homeLoanInterestSelfOccupied, (value) => updateDeduction('homeLoanInterestSelfOccupied', value), 'Cap: ₹2,00,000 (old regime)')}
              </div>
            </div>

            <div className={fieldGroup}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-300">
                <CircleDollarSign size={18} /> FY 2026-27 logic implemented
              </h2>
              <ul className="space-y-2 text-sm text-slate-300">
                {TAX_CHANGE_POINTS.map((point) => (
                  <li key={point} className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-5 lg:sticky lg:top-6 lg:h-fit">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-cyan-300">
              <BarChart3 size={18} /> Payroll Output
            </h2>
            <div className="grid gap-2 text-sm">
              {[
                ['Gross salary', result.grossSalary],
                ['HRA exemption allowed', result.hraExemption],
                ['LTA exemption allowed', result.ltaExemptionAllowed],
                ['Professional tax allowed', result.professionalTaxAllowed],
                ['Standard deduction', result.standardDeduction],
                ['Other deductions allowed', result.chapterVIAAndOtherDeductions],
                ['Taxable income', result.taxableIncome],
                ['Tax by slabs', result.slabTax],
                ['Rebate', result.rebate],
                ['Tax after rebate', result.taxAfterRebate],
                ['Surcharge', result.surcharge],
                ['Health & education cess', result.cess],
                ['Total tax payable', result.totalTax],
                ['Monthly TDS', result.monthlyTds],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                  <span className="text-slate-300">{label}</span>
                  <strong className="text-slate-100">{formatInr(Number(value))}</strong>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
              Effective tax rate: <strong>{result.effectiveTaxRate}%</strong>
            </div>
            <p className="text-xs text-slate-400">
              Note: This tool is for payroll estimation and should be validated against final Form 16, AIS/TIS data, and latest CBDT notifications.
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
}
