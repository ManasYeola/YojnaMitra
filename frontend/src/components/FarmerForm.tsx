import { useState } from 'react';
import type { Farmer } from '../types';
import { states, cropTypes } from '../data/schemesData';

interface FarmerFormProps {
  onSubmit: (farmer: Farmer) => void;
}

export default function FarmerForm({ onSubmit }: FarmerFormProps) {
  const [formData, setFormData] = useState<Farmer>({
    name: '',
    phone: '',
    state: '',
    district: '',
    landSize: 0,
    cropType: '',
    farmerCategory: 'small',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'landSize' || name === 'age' ? Number(value) : value
    }));
  };

  return (
    <div className="farmer-form-container">
      <div className="form-header">
        <h1>🌾 Farmer Registration</h1>
        <p>Enter minimal details to get personalized scheme recommendations</p>
      </div>

      <form onSubmit={handleSubmit} className="farmer-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Mobile Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">State *</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="district">District *</label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              placeholder="Enter your district"
            />
          </div>

          <div className="form-group">
            <label htmlFor="landSize">Land Size (in acres) *</label>
            <input
              type="number"
              id="landSize"
              name="landSize"
              value={formData.landSize || ''}
              onChange={handleChange}
              required
              min="0"
              step="0.5"
              placeholder="e.g., 2.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cropType">Primary Crop *</label>
            <select
              id="cropType"
              name="cropType"
              value={formData.cropType}
              onChange={handleChange}
              required
            >
              <option value="">Select Crop</option>
              {cropTypes.map(crop => (
                <option key={crop} value={crop.toLowerCase()}>{crop}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="farmerCategory">Farmer Category *</label>
            <select
              id="farmerCategory"
              name="farmerCategory"
              value={formData.farmerCategory}
              onChange={handleChange}
              required
            >
              <option value="small">Small (1-2 hectares)</option>
              <option value="marginal">Marginal (&lt;1 hectare)</option>
              <option value="large">Large (&gt;2 hectares)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="age">Age (Optional)</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
              min="18"
              max="100"
              placeholder="Your age"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Find My Schemes →
        </button>
      </form>
    </div>
  );
}
