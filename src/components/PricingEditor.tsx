import React, { useState, useEffect } from 'react';
import { usePricingConfig } from '../hooks/usePricingConfig';

interface PricingEditorProps {
  isAdminMode: boolean;
  onClose?: () => void;
}

export const PricingEditor: React.FC<PricingEditorProps> = ({ isAdminMode, onClose }) => {
  const { pricingData, updatePrice, resetToDefaults, lastUpdated, MIN_PRICE, MAX_PRICE } = usePricingConfig();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [editorName, setEditorName] = useState<string>(localStorage.getItem('pricingEditorName') || '');
  const [showAuditLog, setShowAuditLog] = useState<boolean>(false);

  // Save editor name to localStorage when it changes
  useEffect(() => {
    if (editorName) {
      localStorage.setItem('pricingEditorName', editorName);
    }
  }, [editorName]);

  const handleEditStart = (category: string, item: string, field: string, currentValue: number) => {
    if (!isAdminMode) return;
    
    const fieldKey = `${category}.${item}.${field}`;
    setEditingField(fieldKey);
    setTempValue(currentValue.toString());
  };

  const handleEditSave = async (category: string, item: string, field: string) => {
    if (!editorName.trim()) {
      alert('Please enter your name before editing prices');
      return;
    }

    // Price validation happens in updatePrice function

    // Pass the raw string value - updatePrice will handle parsing
    const success = updatePrice(category as any, item, field, tempValue);
    if (!success) {
      alert(`Price must be between $${MIN_PRICE.toLocaleString()} and $${MAX_PRICE.toLocaleString()}`);
    } else {
      // Log to audit system
      // try {
      //   await logPriceChange(
      //     editorName,
      //     'global',
      //     item,
      //     oldPrice,
      //     newPrice,
      //     `Updated ${field} in ${category}`,
      //     { category, field }
      //   );
      // } catch (error) {
      //   console.error('Failed to log price change:', error);
      // }
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, category: string, item: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave(category, item, field);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };

  const renderEditablePrice = (category: string, item: string, field: string, value: number) => {
    const fieldKey = `${category}.${item}.${field}`;
    const isEditing = editingField === fieldKey;

    if (isEditing) {
      return (
        <input
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => handleEditSave(category, item, field)}
          onKeyDown={(e) => handleKeyDown(e, category, item, field)}
          className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          min="0"
          step="100"
        />
      );
    }

    return (
      <span
        className={`${
          isAdminMode 
            ? 'cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition-colors' 
            : ''
        }`}
        onClick={() => handleEditStart(category, item, field, value)}
        title={isAdminMode ? 'Click to edit' : ''}
      >
        ${value.toLocaleString()}
      </span>
    );
  };

  const renderSection = (title: string, category: keyof typeof pricingData, data: any) => (
    <div className="mb-4">
      <h3 className="text-sm font-bold mb-2 text-gray-700 bg-gray-100 px-3 py-1 rounded">{title}</h3>
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-2 py-1 font-medium text-gray-600">Service</th>
              <th className="text-right px-2 py-1 font-medium text-gray-600">Price</th>
              <th className="text-right px-2 py-1 font-medium text-gray-600">Bundle</th>
              <th className="text-right px-2 py-1 font-medium text-gray-600">F&F</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, item]: [string, any], index) => (
              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-2 py-1 font-medium text-gray-800 text-xs">{key}</td>
                <td className="px-2 py-1 text-right">
                  {renderEditablePrice(category, key, 'price', item.price)}
                </td>
                <td className="px-2 py-1 text-right">
                  {renderEditablePrice(category, key, 'bundleDiscount', item.bundleDiscount)}
                </td>
                <td className="px-2 py-1 text-right">
                  {renderEditablePrice(category, key, 'friendsFamilyDiscount', item.friendsFamilyDiscount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (!isAdminMode) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
        <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">Pricing Configuration</h2>
                <p className="text-xs text-gray-600">
                  Click to edit • Enter to save • Esc to cancel
                  {lastUpdated && (
                    <span className="ml-2 text-gray-500">
                      (Updated: {new Date(lastUpdated).toLocaleTimeString()})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 mr-4">
                <label className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Editor:</span>
                  <input
                    type="text"
                    value={editorName}
                    onChange={(e) => setEditorName(e.target.value)}
                    placeholder="Your name"
                    className="px-2 py-1 border rounded text-sm w-32"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAuditLog(true)}
                  className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded hover:bg-purple-200"
                >
                  View History
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement export functionality with filename
                    console.log('Export functionality to be implemented');
                  }}
                  className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200"
                >
                  Export
                </button>
                <button
                  onClick={resetToDefaults}
                  className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200"
                >
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                {renderSection('ADU Types', 'aduTypes', pricingData.aduTypes)}
                {renderSection('JADU Options', 'jaduOptions', pricingData.jaduOptions)}
                {renderSection('Bundle Additions', 'bundleAdditions', pricingData.bundleAdditions)}
              </div>
              <div>
                {renderSection('Bundle Remodel', 'bundleRemodel', pricingData.bundleRemodel)}
                {renderSection('Add-Ons', 'addOns', pricingData.addOns)}
                
                <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
                  <h4 className="font-bold text-blue-900 mb-1">Quick Tips:</h4>
                  <ul className="text-blue-800 space-y-0.5">
                    <li>• Click price to edit</li>
                    <li>• Auto-saves to browser</li>
                    <li>• Ctrl+Shift+A toggles editor</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Audit Log Viewer Modal */}
      {/* {showAuditLog && (
        <AuditLogViewer 
          requirePin={true}
          onClose={() => setShowAuditLog(false)}
        />
      )} */}
    </>
  );
};