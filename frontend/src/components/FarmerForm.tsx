import { useState } from 'react';
import type { Farmer } from '../types';
import { states } from '../data/schemesData';

interface FarmerFormProps {
  onSubmit: (farmer: Farmer) => void;
}

const FARMER_TYPE_OPTIONS = [
  { value: 'crop_farmer',  label: '🌾 Farmer (Crop)',          desc: 'Grow crops — rice, wheat, vegetables etc.' },
  { value: 'dairy',        label: '🐄 Dairy Farmer',           desc: 'Milk production, cattle rearing' },
  { value: 'fisherman',    label: '🐟 Fisherman',              desc: 'Fishing or aquaculture' },
  { value: 'labourer',     label: '👷 Agriculture Labourer',   desc: "Work on others' farms" },
  { value: 'entrepreneur', label: '🏭 Agri Entrepreneur',      desc: 'Processing, storage, agri-business' },
  { value: 'other',        label: '👤 Other',                  desc: 'Any other agriculture-related activity' },
];

const LAND_OPTIONS = [
  { value: 'owned',  label: '✅ Yes – I own land' },
  { value: 'leased', label: '📄 On Lease' },
  { value: 'none',   label: '❌ No land' },
];

const AGE_OPTIONS = [
  { value: 'below_18', label: 'Below 18' },
  { value: '18_40',    label: '18 – 40'  },
  { value: '41_60',    label: '41 – 60'  },
  { value: 'above_60', label: 'Above 60' },
];

const CASTE_OPTIONS = [
  { value: 'general',       label: 'General' },
  { value: 'sc',            label: 'SC – Scheduled Caste' },
  { value: 'st',            label: 'ST – Scheduled Tribe' },
  { value: 'obc',           label: 'OBC' },
  { value: 'not_disclosed', label: 'Prefer not to say' },
];

const INCOME_OPTIONS = [
  { value: 'below_1L', label: 'Below ₹1 Lakh' },
  { value: '1_3L',     label: '₹1 – 3 Lakh'  },
  { value: '3_8L',     label: '₹3 – 8 Lakh'  },
  { value: 'above_8L', label: 'Above ₹8 Lakh' },
];

const SPECIAL_OPTIONS = [
  { value: 'disability', label: '♿ Person with Disability' },
  { value: 'woman',      label: '👩 Woman Farmer' },
  { value: 'youth',      label: '🧑 Youth (18–35)' },
];

const TOTAL_STEPS = 9;

const STEP_TITLES = [
  '',
  '👤 Your Details',
  '📍 State',
  '🧑‍🌾 Who are you?',
  '🌾 Land Ownership',
  '🎂 Your Age',
  '🏷️ Caste Category',
  '💰 Annual Income',
  '📋 BPL Card',
  '⭐ Special Category',
];

export default function FarmerForm({ onSubmit }: FarmerFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Farmer>({
    name: '',
    phone: '',
    state: '',
    farmerType: undefined,
    landOwnership: undefined,
    ageRange: undefined,
    caste: 'not_disclosed',
    incomeRange: undefined,
    isBPL: undefined,
    specialCategory: [],
  });

  const set = (field: keyof Farmer, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const toggleSpecial = (val: string) => {
    setFormData(prev => {
      const cur = prev.specialCategory ?? [];
      return {
        ...prev,
        specialCategory: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val],
      };
    });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!formData.name.trim() && !!formData.phone.trim();
      case 2: return !!formData.state;
      case 3: return !!formData.farmerType;
      case 4: return !!formData.landOwnership;
      case 5: return !!formData.ageRange;
      case 6: return !!formData.caste;
      case 7: return !!formData.incomeRange;
      case 8: return formData.isBPL !== undefined;
      case 9: return true; // special category is optional
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else onSubmit(formData);
  };

  return (
    <div className="farmer-form-container">
      <div className="form-header">
        <h1>🌾 Find Your Schemes</h1>
        <p>Answer {TOTAL_STEPS} quick questions to get personalised scheme recommendations</p>
      </div>

      {/* Progress bar */}
      <div className="form-progress">
        <div
          className="progress-bar-fill"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
        <span className="progress-text">
          Step {step} of {TOTAL_STEPS} — {STEP_TITLES[step]}
        </span>
      </div>

      <div className="form-step-content">

        {/* Step 1 — Personal Details */}
        {step === 1 && (
          <div className="step-card">
            <h2>What is your name?</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Enter your full name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
              />
            </div>
          </div>
        )}

        {/* Step 2 — State */}
        {step === 2 && (
          <div className="step-card">
            <h2>Which state do you live in?</h2>
            <div className="form-group">
              <select
                value={formData.state}
                onChange={e => set('state', e.target.value)}
              >
                <option value="">Select your state</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 3 — Farmer Type */}
        {step === 3 && (
          <div className="step-card">
            <h2>What best describes you?</h2>
            <div className="option-list">
              {FARMER_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-btn ${formData.farmerType === opt.value ? 'selected' : ''}`}
                  onClick={() => set('farmerType', opt.value)}
                >
                  <span className="opt-label">{opt.label}</span>
                  <span className="opt-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Land Ownership */}
        {step === 4 && (
          <div className="step-card">
            <h2>Do you own agricultural land?</h2>
            <div className="option-list">
              {LAND_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-btn ${formData.landOwnership === opt.value ? 'selected' : ''}`}
                  onClick={() => set('landOwnership', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — Age Range */}
        {step === 5 && (
          <div className="step-card">
            <h2>What is your age?</h2>
            <div className="option-grid">
              {AGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-btn ${formData.ageRange === opt.value ? 'selected' : ''}`}
                  onClick={() => set('ageRange', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6 — Caste */}
        {step === 6 && (
          <div className="step-card">
            <h2>Caste Category <span className="optional-tag">Optional</span></h2>
            <p className="step-note">Helps match caste-specific subsidies and schemes</p>
            <div className="option-list">
              {CASTE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-btn ${formData.caste === opt.value ? 'selected' : ''}`}
                  onClick={() => set('caste', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7 — Income */}
        {step === 7 && (
          <div className="step-card">
            <h2>Annual Family Income</h2>
            <div className="option-list">
              {INCOME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-btn ${formData.incomeRange === opt.value ? 'selected' : ''}`}
                  onClick={() => set('incomeRange', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8 — BPL */}
        {step === 8 && (
          <div className="step-card">
            <h2>Are you a BPL card holder?</h2>
            <p className="step-note">Below Poverty Line ration card</p>
            <div className="option-grid">
              <button
                type="button"
                className={`option-btn ${formData.isBPL === true ? 'selected' : ''}`}
                onClick={() => set('isBPL', true)}
              >
                ✅ Yes
              </button>
              <button
                type="button"
                className={`option-btn ${formData.isBPL === false ? 'selected' : ''}`}
                onClick={() => set('isBPL', false)}
              >
                ❌ No
              </button>
            </div>
          </div>
        )}

        {/* Step 9 — Special Category */}
        {step === 9 && (
          <div className="step-card">
            <h2>Do you belong to any of these? <span className="optional-tag">Optional</span></h2>
            <p className="step-note">Select all that apply</p>
            <div className="option-list">
              {SPECIAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-btn checkbox-btn ${(formData.specialCategory ?? []).includes(opt.value) ? 'selected' : ''}`}
                  onClick={() => toggleSpecial(opt.value)}
                >
                  <span className="checkbox-icon">
                    {(formData.specialCategory ?? []).includes(opt.value) ? '☑' : '☐'}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Navigation */}
      <div className="form-nav">
        {step > 1 && (
          <button
            type="button"
            className="nav-btn back"
            onClick={() => setStep(s => s - 1)}
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          className="nav-btn next"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {step === TOTAL_STEPS ? '🎯 Find My Schemes' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
