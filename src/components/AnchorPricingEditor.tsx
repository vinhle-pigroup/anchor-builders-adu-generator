/**
 * Comprehensive Pricing Editor for Anchor Builders ADU Generator
 * ALL pricing data is editable through this interface
 */

import React, { useState, useEffect } from 'react';
import { useAnchorPricing } from '../hooks/useAnchorPricing';
import { 
  ChevronDown, 
  ChevronRight, 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  X,
  DollarSign,
  Home,
  Wrench,
  Zap,
  PaintBucket,
  Percent,
  MapPin,
  Settings
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const sections: Section[] = [
  { id: 'basePrices', title: 'Base ADU Pricing', icon: <Home size={18} />, description: 'Price per square foot for different ADU types' },
  { id: 'designServices', title: 'Design Services', icon: <DollarSign size={18} />, description: 'Architectural and engineering services' },
  { id: 'utilities', title: 'Utilities', icon: <Zap size={18} />, description: 'Separate meter installations and connections' },
  { id: 'hvac', title: 'HVAC Systems', icon: <Wrench size={18} />, description: 'Heating and cooling options' },
  { id: 'addOns', title: 'Add-ons & Features', icon: <PaintBucket size={18} />, description: 'Additional features and amenities' },
  { id: 'kitchen', title: 'Kitchen & Appliances', icon: <Home size={18} />, description: 'Kitchen upgrades and appliance packages' },
  { id: 'finishes', title: 'Finishes & Upgrades', icon: <PaintBucket size={18} />, description: 'Flooring, doors, and interior finishes' },
  { id: 'sizeAdjustments', title: 'Size Adjustments', icon: <Home size={18} />, description: 'Price adjustments based on square footage' },
  { id: 'discounts', title: 'Discounts', icon: <Percent size={18} />, description: 'Available discount programs' },
  { id: 'settings', title: 'Business Settings', icon: <Settings size={18} />, description: 'Markups, taxes, and contingencies' },
  { id: 'milestones', title: 'Payment Milestones', icon: <DollarSign size={18} />, description: 'Payment schedule percentages' },
  { id: 'regionalMultipliers', title: 'Regional Pricing', icon: <MapPin size={18} />, description: 'City-specific price multipliers' }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

interface AnchorPricingEditorProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AnchorPricingEditor: React.FC<AnchorPricingEditorProps> = ({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose 
}) => {
  const {
    pricing,
    updatePrice,
    resetToDefaults,
    exportPricing,
    importPricing,
    lastUpdated,
    MIN_PRICE,
    MAX_PRICE
  } = useAnchorPricing();

  const [isOpen, setIsOpen] = useState(externalIsOpen ?? false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basePrices']));
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editorName, setEditorName] = useState(localStorage.getItem('anchorEditorName') || '');

  // Update state when external prop changes
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  // Keyboard shortcut (Ctrl+Shift+E for Edit Pricing)
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

  // Save editor name
  useEffect(() => {
    if (editorName) {
      localStorage.setItem('anchorEditorName', editorName);
    }
  }, [editorName]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

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
    
    // Check bounds for non-percentage values
    const isPercentage = ['discounts', 'settings', 'milestones', 'regionalMultipliers'].includes(category);
    if (!isPercentage && (numValue < MIN_PRICE || numValue > MAX_PRICE)) {
      alert(`Price must be between ${formatCurrency(MIN_PRICE)} and ${formatCurrency(MAX_PRICE)}`);
      return;
    }
    
    updatePrice(category as any, key, numValue);
    setEditingField(null);
    setTempValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importPricing(file);
    }
  };

  const renderPriceField = (category: string, key: string, value: number, label: string, isPercentage = false) => {
    const fieldKey = `${category}.${key}`;
    const isEditing = editingField === fieldKey;
    
    // Filter by search term
    if (searchTerm && !label.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    return (
      <div key={fieldKey} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
        <label className="text-sm text-gray-700 flex-1">{label}</label>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave(category, key);
                if (e.key === 'Escape') handleEditCancel();
              }}
              className="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => handleEditSave(category, key)}
              className="text-green-600 hover:text-green-700"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleEditCancel}
              className="text-red-600 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleEditStart(category, key, value)}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            {isPercentage ? formatPercent(value) : formatCurrency(value)}
          </button>
        )}
      </div>
    );
  };

  const renderSection = (sectionId: string) => {
    const data = pricing[sectionId as keyof typeof pricing];
    const isExpanded = expandedSections.has(sectionId);
    const section = sections.find(s => s.id === sectionId);
    const isPercentage = ['discounts', 'settings', 'milestones', 'regionalMultipliers'].includes(sectionId);
    
    if (!data || typeof data !== 'object') return null;

    return (
      <div key={sectionId} className="border rounded-lg mb-3 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            {section?.icon}
            <div className="text-left">
              <div className="font-medium text-gray-900">{section?.title}</div>
              <div className="text-xs text-gray-500">{section?.description}</div>
            </div>
          </div>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        {isExpanded && (
          <div className="p-2 bg-white">
            {Object.entries(data).map(([key, value]) => {
              // Format the label from camelCase
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
              
              return renderPriceField(sectionId, key, value as number, label, isPercentage);
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 z-50"
      >
        <Settings size={20} />
        Pricing Editor (Ctrl+Shift+E)
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Anchor Pricing Editor</h2>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              if (externalOnClose) {
                externalOnClose();
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Editor Name */}
        <div className="px-6 py-3 bg-blue-50 border-b">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Editor Name:</label>
            <input
              type="text"
              value={editorName}
              onChange={(e) => setEditorName(e.target.value)}
              placeholder="Enter your name for audit trail"
              className="flex-1 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prices..."
            className="flex-1 min-w-[200px] px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={() => {
              setExpandedSections(new Set(sections.map(s => s.id)));
            }}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Expand All
          </button>
          
          <button
            onClick={() => setExpandedSections(new Set())}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Collapse All
          </button>
          
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex items-center gap-1"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          
          <button
            onClick={exportPricing}
            className="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors flex items-center gap-1"
          >
            <Download size={16} />
            Export
          </button>
          
          <label className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors cursor-pointer flex items-center gap-1">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {sections.map(section => renderSection(section.id))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
          Press <kbd className="px-2 py-1 bg-white border rounded">Ctrl</kbd> + 
          <kbd className="px-2 py-1 bg-white border rounded ml-1">Shift</kbd> + 
          <kbd className="px-2 py-1 bg-white border rounded ml-1">E</kbd> to toggle this editor
        </div>
      </div>
    </div>
  );
};