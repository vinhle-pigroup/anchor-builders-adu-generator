import React, { useState, useEffect } from 'react';
import { FileText, Clock, User, Home, X } from 'lucide-react';

interface RecentPDFsFABProps {
  onSaveDraft: () => void;
}

interface SavedProposal {
  id: string;
  client: {
    firstName: string;
    lastName: string;
    address: string;
  };
  project: {
    aduType: string;
    squareFootage: number;
  };
  createdAt: string;
  isDraft?: boolean;
}

export const RecentPDFsFAB: React.FC<RecentPDFsFABProps> = ({ onSaveDraft }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentPDFs, setRecentPDFs] = useState<SavedProposal[]>([]);

  // Load recent PDFs (non-drafts only)
  useEffect(() => {
    const loadRecentPDFs = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('anchorProposals') || '[]');
        const completedProposals = saved
          .filter((proposal: SavedProposal) => !proposal.isDraft) // Only completed PDFs
          .sort(
            (a: SavedProposal, b: SavedProposal) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3); // Last 3 PDFs
        setRecentPDFs(completedProposals);
      } catch (error) {
        console.error('Error loading recent PDFs:', error);
        setRecentPDFs([]);
      }
    };

    loadRecentPDFs();
    // Refresh every 30 seconds to catch new PDFs
    const interval = setInterval(loadRecentPDFs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePDFClick = async (proposal: SavedProposal) => {
    // Auto-save current work as draft before opening old PDF
    console.log('💾 Auto-saving current work before viewing PDF...');
    await onSaveDraft();

    // Here you could load the proposal data back into the form
    // For now, just close the FAB
    setIsOpen(false);

    // Show the PDF details or regenerate it
    console.log('📄 Opening PDF:', proposal);
    // You could add logic here to regenerate the PDF with the saved data
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (recentPDFs.length === 0) {
    return null; // Don't show FAB if no recent PDFs
  }

  return (
    <>
      {/* FAB Button */}
      <div className='fixed bottom-6 right-6 z-50'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
            ${
              isOpen
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
            }
            text-white hover:shadow-xl transform hover:scale-105
          `}
          title={isOpen ? 'Close recent PDFs' : 'View recent PDFs'}
        >
          {isOpen ? (
            <X className='w-6 h-6' />
          ) : (
            <div className='relative'>
              <FileText className='w-6 h-6' />
              <div className='absolute -top-1 -right-1 w-5 h-5 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center'>
                <span className='text-xs font-bold text-white'>{recentPDFs.length}</span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Recent PDFs Panel */}
      {isOpen && (
        <div className='fixed bottom-24 right-6 z-40'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-80 max-h-96 overflow-hidden'>
            {/* Header */}
            <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex items-center gap-2'>
                <Clock className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                <h3 className='font-semibold text-gray-800 dark:text-gray-200'>Recent PDFs</h3>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                Click to auto-save current work & view
              </p>
            </div>

            {/* PDF List */}
            <div className='max-h-72 overflow-y-auto'>
              {recentPDFs.map(proposal => (
                <button
                  key={proposal.id}
                  onClick={() => handlePDFClick(proposal)}
                  className='w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 text-left'
                >
                  <div className='flex items-start gap-3'>
                    {/* PDF Icon */}
                    <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                    </div>

                    {/* PDF Details */}
                    <div className='flex-1 min-w-0'>
                      {/* Client Name */}
                      <div className='flex items-center gap-1 mb-1'>
                        <User className='w-3 h-3 text-gray-400' />
                        <span className='font-medium text-gray-800 dark:text-gray-200 truncate'>
                          {proposal.client.firstName} {proposal.client.lastName}
                        </span>
                      </div>

                      {/* Address */}
                      <div className='flex items-center gap-1 mb-1'>
                        <Home className='w-3 h-3 text-gray-400' />
                        <span className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                          {proposal.client.address}
                        </span>
                      </div>

                      {/* Project Info */}
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-blue-600 dark:text-blue-400 font-medium'>
                          {proposal.project.aduType
                            ?.replace(/-/g, ' ')
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())}{' '}
                          • {proposal.project.squareFootage} sq ft
                        </span>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {formatDate(proposal.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className='p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600'>
              <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
                💾 Current work will be auto-saved when viewing PDFs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/20 dark:bg-black/40'
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
