import React from 'react';
import { User, Home, Zap, Paintbrush, Plus, FileText } from 'lucide-react';
// FormSection interface (duplicated for compatibility)
interface FormSection {
  id: string;
  title: string;
  isComplete: boolean;
}

interface HeaderProgressBarProps {
  sections: FormSection[];
  currentSection: string;
  onSectionSelect: (sectionId: string) => void;
}

export const HeaderProgressBar: React.FC<HeaderProgressBarProps> = ({
  sections,
  currentSection,
  onSectionSelect,
}) => {
  console.log('🔍 HeaderProgressBar rendering with:', { sections, currentSection });
  const getSectionIcon = (sectionId: string) => {
    const iconProps = { className: 'w-4 h-4' };
    switch (sectionId) {
      case 'client':
        return <User {...iconProps} />;
      case 'adu':
        return <Home {...iconProps} />;
      case 'utilities':
        return <Zap {...iconProps} />;
      case 'design':
        return <Paintbrush {...iconProps} />;
      case 'addons':
        return <Plus {...iconProps} />;
      case 'notes':
        return <FileText {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  const getNextSection = (currentId: string) => {
    const currentIndex = sections.findIndex(s => s.id === currentId);
    return currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
  };

  const currentSectionData = sections.find(s => s.id === currentSection);
  const nextSection = getNextSection(currentSection);
  const shouldShowPrompt = currentSectionData?.isComplete && nextSection && !nextSection.isComplete;
  const completedSections = sections.filter(s => s.isComplete).length;
  const progressPercentage = (completedSections / sections.length) * 100;

  return (
    <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm'>
      <div className='px-6 py-3'>
        {/* Progress Line Background */}
        <div className='relative'>
          {/* Background Progress Line */}
          <div className='absolute top-6 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-600 rounded-full'></div>

          {/* Active Progress Line */}
          <div
            className='absolute top-6 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out'
            style={{ width: `${progressPercentage}%` }}
          ></div>

          {/* Section Steps */}
          <div className='relative flex justify-between items-center'>
            {sections.map((section, index) => {
              const isActive = currentSection === section.id;
              const isNext = shouldShowPrompt && nextSection?.id === section.id;
              const isCompleted = section.isComplete;

              return (
                <div key={section.id} className='flex flex-col items-center group'>
                  {/* Step Button */}
                  <button
                    onClick={() => onSectionSelect(section.id)}
                    className={`
                      relative w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-105
                      flex items-center justify-center z-10 bg-white dark:bg-gray-800
                      ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800'
                          : isCompleted
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/50 hover:shadow-md'
                            : isNext
                              ? 'border-blue-400 bg-blue-50/70 dark:bg-blue-900/30 shadow-md ring-1 ring-blue-300 dark:ring-blue-700 animate-pulse'
                              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    {/* Step Content */}
                    {isCompleted ? (
                      <div className='text-green-600 dark:text-green-400 font-bold text-lg'>✓</div>
                    ) : isActive ? (
                      <div className='text-blue-600 dark:text-blue-400'>
                        {getSectionIcon(section.id)}
                      </div>
                    ) : isNext ? (
                      <div className='text-blue-500 dark:text-blue-400'>
                        {getSectionIcon(section.id)}
                      </div>
                    ) : (
                      <div className='text-gray-500 dark:text-gray-400'>
                        {getSectionIcon(section.id)}
                      </div>
                    )}

                    {/* Next Section Indicator */}
                    {isNext && (
                      <div className='absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-bounce'>
                        !
                      </div>
                    )}
                  </button>

                  {/* Step Label */}
                  <div className='mt-2 text-center max-w-20'>
                    <div
                      className={`
                      text-xs font-medium truncate
                      ${
                        isActive
                          ? 'text-blue-700 dark:text-blue-400'
                          : isCompleted
                            ? 'text-green-700 dark:text-green-400'
                            : isNext
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400'
                      }
                    `}
                    >
                      {section.title
                        .replace(' Information', '')
                        .replace(' Services', '')
                        .replace('Additional ', 'Add-ons')}
                    </div>

                    {/* Step Number */}
                    <div
                      className={`
                      text-xs mt-0.5
                      ${
                        isActive
                          ? 'text-blue-500 dark:text-blue-400 font-medium'
                          : isCompleted
                            ? 'text-green-500 dark:text-green-400'
                            : 'text-gray-400 dark:text-gray-500'
                      }
                    `}
                    >
                      Step {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Summary */}
        <div className='mt-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-medium'>{completedSections}</span> of{' '}
              <span className='font-medium'>{sections.length}</span> sections complete
            </div>

            {/* Progress Percentage */}
            <div className='flex items-center gap-2'>
              <div className='w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out'
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Next Action Hint */}
          {shouldShowPrompt && nextSection && (
            <div className='flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-pulse'>
              <span className='text-sm font-medium'>Next: {nextSection.title}</span>
              <div className='text-lg'>→</div>
            </div>
          )}

          {/* Completion Celebration */}
          {completedSections === sections.length && (
            <div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
              <span className='text-sm font-medium'>🎉 All sections complete!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
