import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CustomServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: { description: string; price: number }) => void;
}

export const CustomServiceModal: React.FC<CustomServiceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && price > 0) {
      onAdd({ description: description.trim(), price });
      setDescription('');
      setPrice(0);
      onClose();
    }
  };

  const handleClose = () => {
    setDescription('');
    setPrice(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            Add Custom Service
          </h3>
          <button
            onClick={handleClose}
            className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
          >
            <X className='w-5 h-5 text-gray-500 dark:text-gray-400' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-4 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Service Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='e.g., Custom electrical panel upgrade, special flooring, etc.'
              rows={3}
              required
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Price ($)
            </label>
            <input
              type='number'
              value={price || ''}
              onChange={e => {
                const value = e.target.value;
                if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
                  setPrice(value === '' ? 0 : parseInt(value));
                }
              }}
              placeholder='5000'
              min='0'
              step='1'
              required
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors'
            >
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
