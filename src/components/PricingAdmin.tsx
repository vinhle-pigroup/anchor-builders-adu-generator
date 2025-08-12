import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Download, Upload, Check, Clock, Settings, X } from 'lucide-react';
import { PricingConfigManager, DynamicPricingConfig } from '../lib/pricing-config-manager';

interface PricingAdminProps {
  isVisible: boolean;
  onClose: () => void;
}

export function PricingAdmin({ isVisible, onClose }: PricingAdminProps) {
  const [config, setConfig] = useState<DynamicPricingConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'company' | 'pricing' | 'discounts'>('pricing');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Load config on mount
  useEffect(() => {
    if (isVisible) {
      const manager = PricingConfigManager.getInstance();
      setConfig(manager.getConfig());
    }
  }, [isVisible]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!config) return;

    const timer = setTimeout(() => {
      if (config) {
        setIsAutoSaving(true);
        const manager = PricingConfigManager.getInstance();
        manager.updateConfig(config);
        setLastSaved(new Date());
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [config]);

  const handleSave = () => {
    if (!config) return;

    setIsSaving(true);
    const manager = PricingConfigManager.getInstance();
    manager.updateConfig(config);
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleReset = () => {
    if (confirm('Reset all pricing to defaults? This cannot be undone.')) {
      const manager = PricingConfigManager.getInstance();
      manager.resetToDefaults();
      setConfig(manager.getConfig());
      setLastSaved(new Date());
    }
  };

  const handleExport = () => {
    if (!config) return;
    const manager = PricingConfigManager.getInstance();
    manager.exportConfig();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const manager = PricingConfigManager.getInstance();
        manager.importConfig(imported);
        setConfig(manager.getConfig());
        setLastSaved(new Date());
        alert('Configuration imported successfully!');
      } catch (error) {
        alert('Error importing configuration. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const updateConfig = (updates: Partial<DynamicPricingConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates, lastUpdated: new Date() });
  };

  const updateAduPricing = (index: number, pricePerSqFt: number) => {
    if (!config) return;
    const updated = [...config.aduTypePricing];
    updated[index] = { ...updated[index], pricePerSqFt };
    updateConfig({ aduTypePricing: updated });
  };

  const updateUtilityPricing = (index: number, separatePrice: number) => {
    if (!config) return;
    const updated = [...config.utilityOptions];
    updated[index] = { ...updated[index], separatePrice };
    updateConfig({ utilityOptions: updated });
  };

  const updateAddOnPricing = (index: number, price: number) => {
    if (!config) return;
    const updated = [...config.addOnOptions];
    updated[index] = { ...updated[index], price };
    updateConfig({ addOnOptions: updated });
  };

  if (!isVisible || !config) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-anchor-blue" />
            <h2 className="text-xl font-semibold">Admin Pricing Configuration</h2>
            {(isSaving || isAutoSaving) && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 animate-spin" />
                {isSaving ? 'Saving...' : 'Auto-saving...'}
              </div>
            )}
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'pricing', label: 'Pricing Configuration' },
            { id: 'company', label: 'Company Info' },
            { id: 'discounts', label: 'Discounts & Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-anchor-blue border-b-2 border-anchor-blue bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'pricing' && (
            <div className="space-y-8">
              {/* Base ADU Pricing */}
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Base ADU Pricing (per sq ft)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.aduTypePricing.map((adu, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {adu.name}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={adu.pricePerSqFt}
                          onChange={(e) => updateAduPricing(index, Number(e.target.value))}
                          className="w-full pl-8 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                          min="100"
                          max="500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">/sq ft</span>
                      </div>
                      <p className="text-xs text-gray-500">{adu.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Design Services */}
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Design Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      1-Story ADU Design
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={config.designServices.oneStory.default}
                        onChange={(e) => updateConfig({
                          designServices: {
                            ...config.designServices,
                            oneStory: { ...config.designServices.oneStory, default: Number(e.target.value) }
                          }
                        })}
                        className="w-full pl-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                        min="5000"
                        max="20000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      2-Story ADU Design
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={config.designServices.twoStory.default}
                        onChange={(e) => updateConfig({
                          designServices: {
                            ...config.designServices,
                            twoStory: { ...config.designServices.twoStory, default: Number(e.target.value) }
                          }
                        })}
                        className="w-full pl-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                        min="8000"
                        max="25000"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Utilities */}
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Utility Connections (Separate Meters)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.utilityOptions.map((utility, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {utility.name}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={utility.separatePrice}
                          onChange={(e) => updateUtilityPricing(index, Number(e.target.value))}
                          className="w-full pl-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                          min="1000"
                          max="10000"
                        />
                      </div>
                      <p className="text-xs text-gray-500">{utility.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Add-Ons */}
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Add-On Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.addOnOptions.map((addon, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {addon.name}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={addon.price}
                          onChange={(e) => updateAddOnPricing(index, Number(e.target.value))}
                          className="w-full pl-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                          min="1000"
                          max="20000"
                        />
                      </div>
                      <p className="text-xs text-gray-500">{addon.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    defaultValue="Anchor Builders"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <input
                    type="text"
                    defaultValue="CSLB# 1029392"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    defaultValue="(555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue="info@anchorbuilders.io"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Business Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Standard Markup</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.businessSettings.standardMarkup * 100}
                      onChange={(e) => updateConfig({
                        businessSettings: {
                          ...config.businessSettings,
                          standardMarkup: Number(e.target.value) / 100
                        }
                      })}
                      className="w-full pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                      min="5"
                      max="30"
                      step="0.5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Proposal Validity (days)</label>
                  <input
                    type="number"
                    value={config.businessSettings.proposalValidityDays}
                    onChange={(e) => updateConfig({
                      businessSettings: {
                        ...config.businessSettings,
                        proposalValidityDays: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                    min="14"
                    max="90"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Small Unit Threshold (sq ft)</label>
                  <input
                    type="number"
                    value={config.businessSettings.minSizeForStandardPricing}
                    onChange={(e) => updateConfig({
                      businessSettings: {
                        ...config.businessSettings,
                        minSizeForStandardPricing: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-anchor-blue"
                    min="400"
                    max="800"
                  />
                  <p className="text-xs text-gray-500">Units below this size get premium pricing ($250/sq ft)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-anchor-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Now'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Config
            </button>
            <label className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="h-4 w-4" />
              Import Config
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}