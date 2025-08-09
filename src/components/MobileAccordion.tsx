import React, { useState, useEffect } from 'react';
import { ValidatedInput } from './ValidatedInput';
import { FormField } from './FormField';
import { FileText } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { InfoTooltip } from './InfoTooltip';
import { UtilitiesCatalog } from '../data/utilities-catalog';
import { AdditionalServicesCatalog } from '../data/services-catalog';
import { auditFormFields, createFieldTracker } from '../lib/field-parity-audit';

interface MobileAccordionProps {
  formData: any;
  liveCalculation: any;
  updateClientData: (data: any) => void;
  updateProjectData: (data: any) => void;
  pricingData: any;
  setPricingData: (data: any) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isFormComplete: boolean;
}

const MobileAccordion: React.FC<MobileAccordionProps> = ({ 
  formData,
  liveCalculation,
  updateClientData,
  updateProjectData,
  pricingData,
  setPricingData,
  onGenerate,
  isGenerating,
  isFormComplete
}) => {
  const [openSection, setOpenSection] = useState<string>('client');

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
    UtilitiesCatalog.forEach(utility => trackField(`project.utilities.${utility.key}`));
    AdditionalServicesCatalog.forEach(service => trackField(`project.selectedAddOns.${service.key}`));
    
    // Audit against actual form data
    auditFormFields(formData, getTrackedFields(), 'MobileAccordion');
  }, [formData]);

  const sections = [
    { id: 'client', title: 'Client Information', icon: '👤', number: 1 },
    { id: 'location', title: 'Project Location', icon: '📍', number: 2 },
    { id: 'adu', title: 'ADU Configuration', icon: '🏠', number: 3 },
    { id: 'utilities', title: 'Utilities', icon: '⚡', number: 4 },
    { id: 'services', title: 'Additional Services', icon: '➕', number: 5 },
    { id: 'pricing', title: 'Pricing & Generate', icon: '💰', number: 6 }
  ];

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? '' : sectionId);
  };

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

  return (
    <div className="px-4 py-4 space-y-2">
      {sections.map(section => (
        <div key={section.id} className="bg-white rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{section.number}</div>
              <span className="text-lg">{section.icon}</span>
              <span className="font-medium text-slate-800">{section.title}</span>
            </div>
            <span className="text-slate-400">
              {openSection === section.id ? '−' : '+'}
            </span>
          </button>
          
          {openSection === section.id && (
            <div className="px-4 pb-4 border-t border-slate-100">
              {section.id === 'client' && (
                <div className="space-y-3 mt-3">
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
                    />
                  </FormField>
                </div>
              )}

              {section.id === 'location' && (
                <div className="space-y-3 mt-3">
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
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {section.id === 'utilities' && (
                <div className="space-y-3 mt-3">
                  {UtilitiesCatalog.map(utility => {
                    const options = [
                      { title: 'Shared', cost: 0 },
                      { title: 'Separate', cost: utility.key === 'water' ? 1000 : utility.key === 'gas' ? 1500 : 2000 }
                    ];
                    
                    return (
                      <div key={utility.key} className="space-y-2">
                        <div className="flex items-center gap-1">
                          <label className="text-sm font-medium text-slate-700">{utility.label}</label>
                          <InfoTooltip description={utility.description} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
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
              )}

              {section.id === 'services' && (
                <div className="space-y-2 mt-3">
                  {AdditionalServicesCatalog.map(service => (
                    <label key={service.key} className="flex items-center gap-2 text-sm p-2 hover:bg-slate-50 rounded">
                      <input
                        type="checkbox"
                        checked={pricingData.addons[service.key] > 0}
                        onChange={(e) => {
                          setPricingData((prev: any) => ({
                            ...prev,
                            addons: { ...prev.addons, [service.key]: e.target.checked ? (service.price || 0) : 0 },
                          }));

                          const updatedAddons = { ...pricingData.addons, [service.key]: e.target.checked ? (service.price || 0) : 0 };
                          const currentAddons = Object.keys(updatedAddons).filter(
                            key => updatedAddons[key] > 0
                          );
                          
                          updateProjectData({ selectedAddOns: currentAddons });
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 flex-1">{service.label}</span>
                      <InfoTooltip description={service.description} />
                      <span className="text-slate-500 text-sm">${service.price?.toLocaleString() || '0'}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {section.id === 'pricing' && (
                <div className="space-y-4 mt-3">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Price Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Construction:</span>
                        <span>${liveCalculation?.baseConstruction?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Additional Services:</span>
                        <span>${liveCalculation?.addonsTotal?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-blue-600">${liveCalculation?.finalTotal?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={onGenerate}
                    disabled={!isFormComplete || isGenerating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>{isGenerating ? 'Generating...' : 'Generate ADU Proposal'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MobileAccordion;