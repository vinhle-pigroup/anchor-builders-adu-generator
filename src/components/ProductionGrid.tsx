import React, { useEffect } from 'react';
import { ValidatedInput } from './ValidatedInput';
import { FormField } from './FormField';
import { InfoTooltip } from './InfoTooltip';
import { UtilitiesCatalog } from '../data/utilities-catalog';
import { AdditionalServicesCatalog } from '../data/services-catalog';
import { auditFormFields, createFieldTracker } from '../lib/field-parity-audit';

interface ProductionGridProps {
  formData: any;
  updateClientData: (updates: any) => void;
  updateProjectData: (updates: any) => void;
  pricingData: any;
  setPricingData: (data: any) => void;
}

const ProductionGrid: React.FC<ProductionGridProps> = ({ 
  formData, 
  updateClientData,
  updateProjectData,
  pricingData,
  setPricingData
}) => {
  // Field parity audit - development only
  useEffect(() => {
    const { trackField, getTrackedFields } = createFieldTracker();
    
    // Track all rendered fields
    trackField('client.firstName');
    trackField('client.lastName');
    trackField('client.email');
    trackField('client.phone');
    trackField('client.address');
    trackField('client.city');
    trackField('client.state');
    trackField('client.zipCode');
    trackField('project.squareFootage');
    trackField('project.aduType');
    trackField('project.bedrooms');
    trackField('project.bathrooms');
    UtilitiesCatalog.forEach(utility => trackField(`project.utilities.${utility.key}`));
    AdditionalServicesCatalog.forEach(service => trackField(`project.selectedAddOns.${service.key}`));
    
    // Audit against actual form data
    auditFormFields(formData, getTrackedFields(), 'ProductionGrid');
  }, [formData]);
  const handleUtilityChange = (utility: string, cost: number) => {
    setPricingData((prev: any) => ({
      ...prev,
      utilities: { ...prev.utilities, [utility]: cost },
    }));
    
    const utilityMapping: Record<string, { key: string; value: 'shared' | 'separate' }> = {
      'water': { key: 'waterMeter', value: cost === 0 ? 'shared' : 'separate' },
      'gas': { key: 'gasMeter', value: cost === 0 ? 'shared' : 'separate' },
      'electric': { key: 'electricMeter', value: 'separate' }
    };
    
    const mapping = utilityMapping[utility];
    if (mapping) {
      updateProjectData({
        utilities: {
          ...formData.project.utilities,
          [mapping.key]: mapping.value
        }
      });
    }
  };

  const handleAddonChange = (addon: string, cost: number, checked: boolean) => {
    setPricingData((prev: any) => ({
      ...prev,
      addons: { ...prev.addons, [addon]: checked ? cost : 0 },
    }));

    const updatedAddons = { ...pricingData.addons, [addon]: checked ? cost : 0 };
    const currentAddons = Object.keys(updatedAddons).filter(
      key => updatedAddons[key] > 0
    );
    
    updateProjectData({ selectedAddOns: currentAddons });
  };

  return (
    <div className="flex gap-6 px-6 py-4">
      {/* Left Column - Primary Info (35%) */}
      <div className="w-[35%] space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <h3 className="text-sm font-semibold text-slate-800">Client Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="First Name"
              isRequired
              isValid={!!formData.client.firstName?.trim()}
              isTouched={true}
            >
              <ValidatedInput
                value={formData.client.firstName}
                onChange={(value) => updateClientData({ firstName: String(value) })}
                placeholder="John"
                isValid={!!formData.client.firstName?.trim()}
                fieldName="firstName"
                autoFormat
              />
            </FormField>
            <FormField
              label="Last Name"
              isRequired
              isValid={!!formData.client.lastName?.trim()}
              isTouched={true}
            >
              <ValidatedInput
                value={formData.client.lastName}
                onChange={(value) => updateClientData({ lastName: String(value) })}
                placeholder="Smith"
                isValid={!!formData.client.lastName?.trim()}
                fieldName="lastName"
                autoFormat
              />
            </FormField>
          </div>
          <FormField
            label="Email"
            isRequired
            isValid={!!formData.client.email?.trim() && formData.client.email.includes('@')}
            isTouched={true}
          >
            <ValidatedInput
              type="email"
              value={formData.client.email}
              onChange={(value) => updateClientData({ email: String(value) })}
              placeholder="john@example.com"
              isValid={!!formData.client.email?.trim() && formData.client.email.includes('@')}
              fieldName="email"
              autoFormat
            />
          </FormField>
          <FormField
            label="Phone"
            isRequired
            isValid={!!formData.client.phone?.trim() && formData.client.phone.length >= 10}
            isTouched={true}
          >
            <ValidatedInput
              type="tel"
              value={formData.client.phone}
              onChange={(value) => updateClientData({ phone: String(value) })}
              placeholder="(714) 555-0123"
              isValid={!!formData.client.phone?.trim() && formData.client.phone.length >= 10}
              fieldName="phone"
              autoFormat
            />
          </FormField>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="text-sm font-semibold text-slate-800">Project Location</h3>
          </div>
          <FormField
            label="Property Address"
            isRequired
            isValid={!!formData.client.address?.trim()}
            isTouched={true}
          >
            <ValidatedInput
              value={formData.client.address}
              onChange={(value) => updateClientData({ address: String(value) })}
              placeholder="123 Main Street"
              isValid={!!formData.client.address?.trim()}
              fieldName="address"
              autoFormat
            />
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField
              label="City"
              isRequired
              isValid={!!formData.client.city?.trim()}
              isTouched={true}
            >
              <ValidatedInput
                value={formData.client.city}
                onChange={(value) => updateClientData({ city: String(value) })}
                placeholder="Garden Grove"
                isValid={!!formData.client.city?.trim()}
                fieldName="city"
                autoFormat
              />
            </FormField>
            <FormField
              label="State"
              isRequired
              isValid={!!formData.client.state?.trim()}
              isTouched={true}
            >
              <ValidatedInput
                value={formData.client.state}
                onChange={(value) => updateClientData({ state: String(value) })}
                placeholder="CA"
                isValid={!!formData.client.state?.trim()}
                fieldName="state"
                autoFormat
              />
            </FormField>
            <FormField
              label="ZIP"
              isRequired
              isValid={!!formData.client.zipCode?.trim() && formData.client.zipCode.length >= 5}
              isTouched={true}
            >
              <ValidatedInput
                value={formData.client.zipCode}
                onChange={(value) => updateClientData({ zipCode: String(value) })}
                placeholder="92683"
                isValid={!!formData.client.zipCode?.trim() && formData.client.zipCode.length >= 5}
                fieldName="zipCode"
                autoFormat
              />
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <h3 className="text-sm font-semibold text-slate-800">ADU Configuration</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Square Feet
              </label>
              <input
                type="number"
                value={pricingData.sqft}
                onChange={e => {
                  const value = parseInt(e.target.value) || 600;
                  setPricingData((prev: any) => ({ ...prev, sqft: value }));
                  updateProjectData({ squareFootage: value });
                }}
                min="300"
                max="1200"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ADU Type
              </label>
              <select 
                value={pricingData.aduType || 'detached-1story'}
                onChange={(e) => {
                  const type = e.target.value;
                  const prices = { 'detached-1story': 220, 'detached-2story': 240, 'attached': 200, 'junior-adu': 244 };
                  setPricingData((prev: any) => ({ ...prev, aduType: type, pricePerSqFt: prices[type as keyof typeof prices] }));
                  updateProjectData({ aduType: type === 'attached' ? 'attached' : 'detached' });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="detached-1story">Detached 1-Story</option>
                <option value="detached-2story">Detached 2-Story</option>
                <option value="attached">Attached ADU</option>
                <option value="junior-adu">Junior ADU</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                value={pricingData.bedrooms}
                onChange={e => {
                  const value = parseInt(e.target.value) || 0;
                  setPricingData((prev: any) => ({ ...prev, bedrooms: value }));
                  updateProjectData({ bedrooms: value });
                }}
                min="0"
                max="4"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                value={pricingData.bathrooms}
                onChange={e => {
                  const value = parseInt(e.target.value) || 1;
                  setPricingData((prev: any) => ({ ...prev, bathrooms: value }));
                  updateProjectData({ bathrooms: value });
                }}
                min="1"
                max="3"
                step="0.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Column - Construction & Services (40%) */}
      <div className="w-[40%] space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <h3 className="text-sm font-semibold text-slate-800">Utilities</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {UtilitiesCatalog.map(utility => {
              const options = [
                { title: 'Shared', cost: 0 },
                { title: 'Separate', cost: utility.key === 'water' ? 1000 : utility.key === 'gas' ? 1500 : 2000 }
              ];
              
              return (
                <div key={utility.key} className="grid grid-cols-4 gap-2 items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-slate-700">{utility.label}</span>
                    <InfoTooltip description={utility.description} />
                  </div>
                  <div className="col-span-3 grid grid-cols-2 gap-2">
                    {options.map(option => (
                      <button
                        key={`${utility.key}-${option.cost}`}
                        onClick={() => handleUtilityChange(utility.key, option.cost)}
                        className={`p-2 rounded-lg border text-center text-sm transition-all ${
                          pricingData.utilities[utility.key] === option.cost
                            ? 'border-blue-500 bg-blue-50 font-semibold'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <span className="block font-medium text-slate-800">{option.title}</span>
                        <span className={`text-xs font-semibold ${option.cost === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                          {option.cost === 0 ? 'No Cost' : `+$${option.cost.toLocaleString()}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
            <h3 className="text-sm font-semibold text-slate-800">Additional Services</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {AdditionalServicesCatalog.map(service => (
              <label key={service.key} className="flex items-center gap-2 text-sm p-2 hover:bg-slate-50 rounded">
                <input
                  type="checkbox"
                  checked={pricingData.addons[service.key] > 0}
                  onChange={(e) => handleAddonChange(service.key, service.price || 0, e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 flex-1">{service.label}</span>
                <InfoTooltip description={service.description} />
                <span className="text-slate-500 text-sm">${service.price?.toLocaleString() || '0'}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionGrid;