import { ArrowLeft, Download, Upload, Settings, Trash2 } from 'lucide-react';
import type { AnchorProposalFormData } from '../types/proposal';

interface AdminPageProps {
  savedProposals: AnchorProposalFormData[];
  setSavedProposals: (proposals: AnchorProposalFormData[]) => void;
  onBack: () => void;
}

export function AdminPage({ savedProposals, setSavedProposals, onBack }: AdminPageProps) {
  const exportProposals = () => {
    const dataStr = JSON.stringify(savedProposals, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `anchor-proposals-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importProposals = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
              const updated = [...savedProposals, ...imported];
              setSavedProposals(updated);
              localStorage.setItem('anchorProposals', JSON.stringify(updated));
              alert(`Imported ${imported.length} proposals successfully.`);
            } else {
              alert('Invalid file format. Please select a valid proposals JSON file.');
            }
          } catch (error) {
            alert('Error reading file. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearAllProposals = () => {
    if (confirm('Are you sure you want to clear all proposals? This action cannot be undone.')) {
      setSavedProposals([]);
      localStorage.removeItem('anchorProposals');
      alert('All proposals have been cleared.');
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold text-slate-800'>Admin Settings</h1>
          <button
            onClick={onBack}
            className='flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-white border border-slate-200 rounded-lg'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Home</span>
          </button>
        </div>
        
        <div className='space-y-6'>
          {/* Data Management */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold text-slate-800 mb-4 flex items-center'>
              <Settings className='w-5 h-5 mr-2' />
              Data Management
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <button
                onClick={exportProposals}
                className='flex items-center justify-center space-x-2 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors'
              >
                <Download className='w-5 h-5 text-green-600' />
                <span className='font-medium text-green-700'>Export Proposals</span>
              </button>
              
              <button
                onClick={importProposals}
                className='flex items-center justify-center space-x-2 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors'
              >
                <Upload className='w-5 h-5 text-blue-600' />
                <span className='font-medium text-blue-700'>Import Proposals</span>
              </button>
              
              <button
                onClick={clearAllProposals}
                className='flex items-center justify-center space-x-2 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors'
              >
                <Trash2 className='w-5 h-5 text-red-600' />
                <span className='font-medium text-red-700'>Clear All</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold text-slate-800 mb-4'>Statistics</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <div className='text-2xl font-bold text-blue-600'>{savedProposals.length}</div>
                <div className='text-sm text-blue-700'>Total Proposals</div>
              </div>
              
              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <div className='text-2xl font-bold text-green-600'>
                  {Math.round(savedProposals.reduce((sum, p) => sum + (p.project?.squareFootage || 0), 0) / savedProposals.length) || 0}
                </div>
                <div className='text-sm text-green-700'>Avg. Square Footage</div>
              </div>
              
              <div className='text-center p-4 bg-purple-50 rounded-lg'>
                <div className='text-2xl font-bold text-purple-600'>
                  {new Set(savedProposals.map(p => p.client?.city)).size}
                </div>
                <div className='text-sm text-purple-700'>Unique Cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}