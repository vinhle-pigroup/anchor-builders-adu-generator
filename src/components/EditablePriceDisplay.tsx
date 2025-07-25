import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';

interface EditablePriceDisplayProps {
  value: number;
  onSave: (newValue: number) => void;
  label?: string;
  suffix?: string;
  prefix?: string;
  className?: string;
  format?: 'currency' | 'percentage' | 'number';
}

export function EditablePriceDisplay({
  value,
  onSave,
  label,
  suffix = '',
  prefix = '$',
  className = '',
  format = 'currency',
}: EditablePriceDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `${prefix}${val.toLocaleString()}${suffix}`;
      case 'percentage':
        return `${val}%`;
      case 'number':
        return `${prefix}${val}${suffix}`;
      default:
        return `${prefix}${val.toLocaleString()}${suffix}`;
    }
  };

  const handleSave = () => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue) && newValue >= 0) {
      onSave(newValue);
      setIsEditing(false);
    } else {
      // Reset to original value if invalid
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {label && <span className='text-sm text-slate-600'>{label}:</span>}
        <div className='flex items-center space-x-1'>
          {prefix && format === 'currency' && (
            <span className='text-sm text-slate-600'>{prefix}</span>
          )}
          <input
            type='number'
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className='w-24 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200'
            autoFocus
          />
          {suffix && <span className='text-sm text-slate-600'>{suffix}</span>}
          <button
            onClick={handleSave}
            className='p-1 text-green-600 hover:bg-green-50 rounded transition-colors'
            title='Save'
          >
            <Check className='w-3 h-3' />
          </button>
          <button
            onClick={handleCancel}
            className='p-1 text-red-600 hover:bg-red-50 rounded transition-colors'
            title='Cancel'
          >
            <X className='w-3 h-3' />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      {label && <span className='text-sm text-slate-600'>{label}:</span>}
      <span className='font-medium'>{formatValue(value)}</span>
      <button
        onClick={() => setIsEditing(true)}
        className='p-1 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all'
        title='Edit price'
      >
        <Edit3 className='w-3 h-3' />
      </button>
    </div>
  );
}
