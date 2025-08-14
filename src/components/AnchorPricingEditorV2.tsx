/**
 * Anchor Pricing Editor V2 - Matches actual form fields
 * Based on HOL design with 2-column layout
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Upload, RotateCcw, History } from 'lucide-react';


// Actual pricing fields from your form - EXACT MATCH
const pricingStructure = {
  // Left Column
  aduTypes: [
    { key: 'detached', label: 'Detached ADU', value: 240, description: '$/sqft base price' },
    { key: 'attached', label: 'Attached ADU', value: 240, description: '$/sqft base price' },
    { key: 'jadu', label: 'JADU', value: 200, description: '$/sqft base price' },
  ],
  
  squareFootage: [
    { key: 'baseRate', label: 'Base Rate (600+ sqft)', value: 240, description: '$/sqft standard' },
    { key: 'smallUnitPremium', label: 'Small Unit (<600 sqft)', value: 250, description: '$/sqft premium' },
    { key: 'tinyUnitPremium', label: 'Tiny Unit (<400 sqft)', value: 260, description: '$/sqft premium' },
  ],
  
  bedrooms: [
    { key: 'studio', label: 'Studio (0 BR)', value: 0, description: 'Base configuration' },
    { key: 'oneBedroom', label: '1 Bedroom', value: 0, description: 'Standard' },
    { key: 'twoBedroom', label: '2 Bedroom', value: 0, description: 'Standard' },
    { key: 'threeBedroom', label: '3 Bedroom', value: 0, description: 'Standard' },
  ],
  
  bathrooms: [
    { key: 'oneBathroom', label: '1 Bathroom', value: 0, description: 'Standard' },
    { key: 'oneHalfBathroom', label: '1.5 Bathrooms', value: 4000, description: 'Half bath addition' },
    { key: 'twoBathroom', label: '2 Bathrooms', value: 8000, description: 'Full bath addition' },
  ],
  
  hvac: [
    { key: 'centralAc', label: 'Central AC', value: 0, description: 'Standard HVAC included' },
    { key: 'miniSplit', label: 'Mini-Split', value: 0, description: 'Alternative HVAC option' },
  ],
  
  // Right Column
  utilities: [
    { key: 'waterMeterSeparate', label: 'Water Meter (Separate)', value: 3500, description: 'New meter' },
    { key: 'gasMeterSeparate', label: 'Gas Meter (Separate)', value: 3500, description: 'New meter' },
    { key: 'electricMeterSeparate', label: 'Electric Meter (Separate)', value: 0, description: 'Included' },
    { key: 'sewerConnection', label: 'Sewer Connection', value: 0, description: 'Existing lateral' },
    { key: 'electricalPanel', label: 'Electrical Panel Upgrade', value: 3000, description: 'If needed' },
  ],
  
  additionalServices: [
    { key: 'designServices', label: 'Design Services', value: 12500, description: 'Complete plans & engineering' },
    { key: 'solarReady', label: 'Solar Ready', value: 0, description: 'Included (Title 24)' },
    { key: 'femaCompliance', label: 'FEMA Compliance', value: 0, description: 'When required' },
    { key: 'extraBathroom', label: 'Extra Bathroom', value: 8000, description: 'Additional full bath' },
    { key: 'dedicatedDriveway', label: 'Dedicated Driveway', value: 5000, description: 'ADU access' },
    { key: 'basicLandscaping', label: 'Basic Landscaping', value: 10000, description: 'Front & back' },
  ],
  
  customServices: [
    { key: 'custom1', label: 'Custom Service 1', value: 0, description: 'User defined' },
    { key: 'custom2', label: 'Custom Service 2', value: 0, description: 'User defined' },
    { key: 'custom3', label: 'Custom Service 3', value: 0, description: 'User defined' },
  ],
  
  discount: [
    { key: 'friendsAndFamily', label: 'Friends & Family Discount', value: 0.10, description: '10% off total' },
  ],
};

interface AnchorPricingEditorV2Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AnchorPricingEditorV2: React.FC<AnchorPricingEditorV2Props> = ({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose 
}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen ?? false);
  const [editorName, setEditorName] = useState(localStorage.getItem('anchorEditorName') || '');
  const [pricing, setPricing] = useState(() => {
    const saved = localStorage.getItem('anchor-pricing-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to default
      }
    }
    return pricingStructure;
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when external prop changes
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Keyboard shortcut (Ctrl+Shift+E)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Save to localStorage whenever pricing changes
  useEffect(() => {
    localStorage.setItem('anchor-pricing-v2', JSON.stringify(pricing));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('anchor:pricing-updated', { 
      detail: { pricing, editor: editorName } 
    }));
  }, [pricing, editorName]);

  const handleEditStart = (category: string, key: string, value: number) => {
    if (!editorName) {
      alert('Please enter your name at the top of the editor first');
      return;
    }
    setEditingField(`${category}.${key}`);
    setTempValue(value.toString());
  };

  const handleEditSave = (category: string, key: string) => {
    const numValue = parseFloat(tempValue);
    if (isNaN(numValue)) {
      alert('Please enter a valid number');
      return;
    }
    
    setPricing((prev: any) => ({
      ...prev,
      [category]: prev[category].map((item: any) =>
        item.key === key ? { ...item, value: numValue } : item
      ),
    }));
    
    setEditingField(null);
    setTempValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(pricing, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `anchor-pricing-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all prices to defaults?')) {
      setPricing(pricingStructure);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        // Validate structure
        if (imported.aduTypes && imported.utilities && imported.additionalServices) {
          setPricing(imported);
          alert('Pricing configuration imported successfully!');
        } else {
          alert('Invalid pricing configuration file');
        }
      } catch (error) {
        alert('Error reading file: ' + error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be imported again
    if (e.target) e.target.value = '';
  };

  const renderPriceTable = (title: string, items: any[], category: string) => {
    return (
      <div className="mb-4">
        <div className="bg-gray-100 px-2 py-1 border-b border-gray-300">
          <h3 className="text-xs font-bold text-gray-800">{title}</h3>
        </div>
        <table className="w-full bg-white text-xs">
          <tbody>
            {items.map((item) => {
              const fieldKey = `${category}.${item.key}`;
              const isEditing = editingField === fieldKey;
              const isPercentage = category === 'discount';
              
              return (
                <tr key={item.key} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-1 text-gray-700">
                    <div>
                      <div className="font-medium text-xs">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-400">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave(category, item.key);
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          className="w-16 px-1 py-0.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditSave(category, item.key)}
                          className="text-green-600 hover:text-green-700 text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditStart(category, item.key, item.value)}
                        className="text-blue-600 hover:bg-blue-50 px-1 py-0.5 rounded transition-colors font-medium text-xs"
                      >
                        {isPercentage 
                          ? `${(item.value * 100).toFixed(0)}%`
                          : `$${item.value.toLocaleString()}`
                        }
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pricing Configuration</h2>
            <p className="text-xs text-gray-500 mt-1">
              Click to edit • Enter to save • Esc to cancel
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Editor:</label>
              <input
                type="text"
                value={editorName}
                onChange={(e) => {
                  setEditorName(e.target.value);
                  localStorage.setItem('anchorEditorName', e.target.value);
                }}
                placeholder="Your name"
                className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => alert('History coming soon')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
            >
              <History size={14} />
              History
            </button>
            <button
              onClick={handleImport}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center gap-1"
            >
              <Upload size={14} />
              Import
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded flex items-center gap-1"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center gap-1"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => {
                setIsOpen(false);
                if (externalOnClose) {
                  externalOnClose();
                }
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - 3 Column Layout */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Left Column */}
            <div>
              {renderPriceTable('ADU TYPES', pricing.aduTypes, 'aduTypes')}
              {renderPriceTable('SQUARE FOOTAGE', pricing.squareFootage, 'squareFootage')}
              {renderPriceTable('BEDROOMS', pricing.bedrooms, 'bedrooms')}
            </div>

            {/* Middle Column */}
            <div>
              {renderPriceTable('BATHROOMS', pricing.bathrooms, 'bathrooms')}
              {renderPriceTable('HVAC SYSTEMS', pricing.hvac, 'hvac')}
              {renderPriceTable('UTILITIES', pricing.utilities, 'utilities')}
            </div>

            {/* Right Column */}
            <div>
              {renderPriceTable('ADDITIONAL SERVICES', pricing.additionalServices, 'additionalServices')}
              {renderPriceTable('CUSTOM SERVICES', pricing.customServices, 'customServices')}
              {renderPriceTable('DISCOUNT', pricing.discount, 'discount')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 text-center text-sm text-gray-600">
          Press <kbd className="px-2 py-1 bg-white border rounded">Ctrl</kbd> + 
          <kbd className="px-2 py-1 bg-white border rounded ml-1">Shift</kbd> + 
          <kbd className="px-2 py-1 bg-white border rounded ml-1">E</kbd> to toggle this editor
        </div>
      </div>
    </div>
  );
};