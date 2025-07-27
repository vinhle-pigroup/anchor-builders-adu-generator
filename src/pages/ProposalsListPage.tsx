import { ArrowLeft, FileText, Edit, Copy, Trash2 } from 'lucide-react';
import type { AnchorProposalFormData } from '../types/proposal';

interface ProposalsListPageProps {
  savedProposals: AnchorProposalFormData[];
  setSavedProposals: (proposals: AnchorProposalFormData[]) => void;
  onEdit: (proposal: AnchorProposalFormData) => void;
  onBack: () => void;
}

export function ProposalsListPage({ 
  savedProposals, 
  setSavedProposals, 
  onEdit, 
  onBack 
}: ProposalsListPageProps) {
  
  const deleteProposal = (proposalId: string) => {
    if (confirm('Are you sure you want to delete this proposal?')) {
      const updated = savedProposals.filter(p => p.id !== proposalId);
      setSavedProposals(updated);
      localStorage.setItem('anchorProposals', JSON.stringify(updated));
    }
  };

  const duplicateProposal = (proposal: AnchorProposalFormData) => {
    const duplicated: AnchorProposalFormData = {
      ...proposal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      client: {
        ...proposal.client,
        firstName: proposal.client.firstName + ' (Copy)',
      }
    };
    const updated = [...savedProposals, duplicated];
    setSavedProposals(updated);
    localStorage.setItem('anchorProposals', JSON.stringify(updated));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (savedProposals.length === 0) {
    return (
      <div className='min-h-screen bg-slate-50 p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-2xl font-bold text-slate-800'>Saved Proposals</h1>
            <button
              onClick={onBack}
              className='flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-white border border-slate-200 rounded-lg'
            >
              <ArrowLeft className='w-4 h-4' />
              <span>Back to Home</span>
            </button>
          </div>
          
          <div className='text-center py-12'>
            <FileText className='w-16 h-16 text-slate-400 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-slate-600 mb-2'>No Proposals Yet</h2>
            <p className='text-slate-500'>Create your first proposal to see it here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-slate-800'>Saved Proposals</h1>
            <p className='text-slate-600'>{savedProposals.length} proposal{savedProposals.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onBack}
            className='flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-white border border-slate-200 rounded-lg'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Home</span>
          </button>
        </div>

        <div className='grid gap-4'>
          {savedProposals.map((proposal) => (
            <div key={proposal.id || proposal.createdAt} className='bg-white rounded-lg shadow-sm border border-slate-200 p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-3'>
                    <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <FileText className='w-5 h-5 text-blue-600' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-slate-800 text-lg'>
                        {proposal.client.firstName} {proposal.client.lastName}
                      </h3>
                      <p className='text-slate-600 text-sm'>{proposal.client.address}</p>
                      <p className='text-slate-500 text-xs'>{proposal.client.city}, {proposal.client.state}</p>
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    <div>
                      <span className='text-slate-500'>Size:</span>
                      <div className='font-medium text-slate-800'>{proposal.project.squareFootage} sq ft</div>
                    </div>
                    <div>
                      <span className='text-slate-500'>Layout:</span>
                      <div className='font-medium text-slate-800'>{proposal.project.bedrooms}BR / {proposal.project.bathrooms}BA</div>
                    </div>
                    <div>
                      <span className='text-slate-500'>Created:</span>
                      <div className='font-medium text-slate-800'>{formatDate(proposal.createdAt)}</div>
                    </div>
                    <div>
                      <span className='text-slate-500'>Modified:</span>
                      <div className='font-medium text-slate-800'>{formatDate(proposal.lastModified)}</div>
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-2 ml-4'>
                  <button
                    onClick={() => onEdit(proposal)}
                    className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                    title="Edit Proposal"
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => duplicateProposal(proposal)}
                    className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                    title="Duplicate Proposal"
                  >
                    <Copy className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => deleteProposal(proposal.id || proposal.createdAt)}
                    className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                    title="Delete Proposal"
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}