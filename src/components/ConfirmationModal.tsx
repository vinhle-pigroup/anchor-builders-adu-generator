import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  formData?: any;
  total?: number;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Proposal Generation',
  message = 'Are you ready to generate this proposal?',
  confirmText = 'Generate Proposal',
  cancelText = 'Review Again',
  formData,
  total = 0
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
          </div>

          {/* Summary */}
          {formData && (
            <div className="bg-stone-50 rounded-lg p-4 mb-4 space-y-2 text-xs">
              <div className="font-semibold text-gray-700 mb-2">Proposal Summary:</div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="text-gray-800">
                  {formData.firstName && formData.lastName 
                    ? `${formData.firstName} ${formData.lastName}`
                    : 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Property Type:</span>
                <span className="text-gray-800">{formData.propertyType || 'Not specified'}</span>
              </div>

              {formData.friendsFamilyDiscount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">F&F Discount:</span>
                  <span className="text-green-600 font-medium">Applied</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">JADU:</span>
                <span className="text-gray-800">{formData.jadu?.selected ? 'Yes' : 'No'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Bundle:</span>
                <span className="text-gray-800">{formData.bundle ? 'Yes' : 'No'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Remodel:</span>
                <span className="text-gray-800">{formData.remodel ? 'Yes' : 'No'}</span>
              </div>

              <div className="border-t border-stone-200 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-800">Total Investment:</span>
                  <span className="text-stone-600">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <p className="text-sm text-gray-600 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 border border-gray-300"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all duration-300 bg-stone-600 hover:bg-stone-700 text-white border-2 border-stone-600 hover:border-stone-700 shadow-lg hover:shadow-xl"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};