import { useState, useEffect } from 'react';
import { Save, RotateCcw, Type, Settings } from 'lucide-react';
import {
  TemplateTextConfig,
  getTemplateText,
  saveTemplateText,
  resetTemplateText,
  defaultTemplateText,
} from '../data/template-text-config';

interface AdminTextEditorProps {
  onSave?: () => void;
}

export function AdminTextEditor({ onSave }: AdminTextEditorProps) {
  const [textConfig, setTextConfig] = useState<TemplateTextConfig>(getTemplateText());
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load saved configuration on mount
  useEffect(() => {
    setTextConfig(getTemplateText());
  }, []);

  // Update text configuration
  const updateText = (path: string, value: string) => {
    const pathParts = path.split('.');
    const newConfig = { ...textConfig };

    // Navigate to the nested property and update it
    let current: any = newConfig;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;

    setTextConfig(newConfig);
    setHasChanges(true);
  };

  // Save changes
  const handleSave = () => {
    saveTemplateText(textConfig);
    setHasChanges(false);
    setSaveMessage('Template text saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);

    if (onSave) {
      onSave();
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all text to defaults? This cannot be undone.')) {
      resetTemplateText();
      setTextConfig(defaultTemplateText);
      setHasChanges(true);
      setSaveMessage('Text reset to defaults. Click Save to apply changes.');
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <Type className='w-6 h-6 text-blue-600' />
          <h2 className='text-2xl font-bold text-gray-900'>Template Text Editor</h2>
        </div>

        <div className='flex items-center space-x-3'>
          <button
            onClick={handleReset}
            className='flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
          >
            <RotateCcw className='w-4 h-4' />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className='w-4 h-4' />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-md'>
          <p className='text-green-800 text-sm'>{saveMessage}</p>
        </div>
      )}

      <div className='space-y-8'>
        {/* Scope of Work Section */}
        <div className='border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Settings className='w-5 h-5 mr-2 text-blue-600' />
            Scope of Work Section
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Section Header</label>
              <input
                type='text'
                value={textConfig.scopeOfWork.header}
                onChange={e => updateText('scopeOfWork.header', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Buildout Description
              </label>
              <input
                type='text'
                value={textConfig.scopeOfWork.buildoutDescription}
                onChange={e => updateText('scopeOfWork.buildoutDescription', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Standard Finishes Text
              </label>
              <input
                type='text'
                value={textConfig.scopeOfWork.standardFinishes}
                onChange={e => updateText('scopeOfWork.standardFinishes', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Allowance Worksheet Text
              </label>
              <input
                type='text'
                value={textConfig.scopeOfWork.allowanceWorksheet}
                onChange={e => updateText('scopeOfWork.allowanceWorksheet', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Appliances Included Text
              </label>
              <input
                type='text'
                value={textConfig.scopeOfWork.appliances.included}
                onChange={e => updateText('scopeOfWork.appliances.included', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Appliances Excluded Text
              </label>
              <input
                type='text'
                value={textConfig.scopeOfWork.appliances.excluded}
                onChange={e => updateText('scopeOfWork.appliances.excluded', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className='border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Services & Features</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Central AC Text
              </label>
              <input
                type='text'
                value={textConfig.services.hvac.centralAc}
                onChange={e => updateText('services.hvac.centralAc', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Mini-Split Text
              </label>
              <input
                type='text'
                value={textConfig.services.hvac.miniSplit}
                onChange={e => updateText('services.hvac.miniSplit', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Shared Gas Meter Text
              </label>
              <input
                type='text'
                value={textConfig.services.gas.shared}
                onChange={e => updateText('services.gas.shared', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Separate Gas Meter Text
              </label>
              <input
                type='text'
                value={textConfig.services.gas.separate}
                onChange={e => updateText('services.gas.separate', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Shared Water Meter Text
              </label>
              <input
                type='text'
                value={textConfig.services.water.shared}
                onChange={e => updateText('services.water.shared', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Separate Water Meter Text
              </label>
              <input
                type='text'
                value={textConfig.services.water.separate}
                onChange={e => updateText('services.water.separate', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>
        </div>

        {/* Pricing Table Section */}
        <div className='border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Pricing Table</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Pricing Table Header
              </label>
              <input
                type='text'
                value={textConfig.pricing.header}
                onChange={e => updateText('pricing.header', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Design Phase Text
              </label>
              <input
                type='text'
                value={textConfig.pricing.phases.design.replace('<br><br>', ' ')}
                onChange={e =>
                  updateText('pricing.phases.design', e.target.value.replace(' ', '<br><br>'))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Coordination Phase Text
              </label>
              <input
                type='text'
                value={textConfig.pricing.phases.coordination.replace('<br>', ' ')}
                onChange={e =>
                  updateText('pricing.phases.coordination', e.target.value.replace(' ', '<br>'))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Construction Phase Text
              </label>
              <input
                type='text'
                value={textConfig.pricing.phases.construction}
                onChange={e => updateText('pricing.phases.construction', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
          <p className='text-yellow-800 text-sm'>
            You have unsaved changes. Click "Save Changes" to apply them to all templates.
          </p>
        </div>
      )}
    </div>
  );
}
