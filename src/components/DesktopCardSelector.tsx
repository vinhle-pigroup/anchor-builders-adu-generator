import React from 'react';
import { designTokens } from '../lib/design-tokens';
// FormSection interface (duplicated for compatibility)
export interface FormSection {
  id: string;
  title: string;
  isComplete: boolean;
}
import { User, Home, Zap, Paintbrush, Plus, FileText } from 'lucide-react';

interface DesktopCardSelectorProps {
  sections: FormSection[];
  currentSection: string;
  onSectionSelect: (sectionId: string) => void;
  onExpandAll?: () => void;
  allExpanded?: boolean;
}

export const DesktopCardSelector: React.FC<DesktopCardSelectorProps> = ({
  sections,
  currentSection,
  onSectionSelect,
  onExpandAll,
  allExpanded,
}) => {
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

  return (
    <div className='w-full h-full bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 flex flex-col'>
      {/* Header */}
      <div className='p-3 border-b border-gray-200 dark:border-gray-700'>
        <h2
          className={`${designTokens.typography.headings.h4} mb-2 text-gray-800 dark:text-gray-200`}
        >
          Form Sections
        </h2>
      </div>

      {/* Section Buttons - Single Column Like Screenshot */}
      <div className='flex-1 p-3 overflow-y-auto'>
        <div className='space-y-2'>
          {sections.map((section, index) => {
            const isActive = currentSection === section.id;
            const isNext = shouldShowPrompt && nextSection?.id === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionSelect(section.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200
                  ${
                    section.isComplete
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : isActive
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                {/* Numbered Circle with Checkmark */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                    ${
                      section.isComplete
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                          ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }
                  `}
                >
                  {section.isComplete ? '✓' : index + 1}
                </div>

                {/* Section Name and Icon */}
                <div className='flex items-center gap-2 flex-1'>
                  {getSectionIcon(section.id)}
                  <span className='text-sm font-medium text-gray-800'>
                    {section.title.replace(' Information', '').replace(' Services', '')}
                  </span>
                </div>

                {/* Next Arrow Indicator */}
                {isNext && (
                  <div className='text-blue-500 animate-pulse'>
                    →
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Status - Compact */}
      {sections.every(s => s.isComplete) && (
        <div className='p-2 bg-green-50 dark:bg-green-900/30 border-t border-green-200 dark:border-green-700'>
          <div className={`text-xs text-green-700 dark:text-green-400 font-medium text-center`}>
            🎉 Complete!
          </div>
        </div>
      )}
    </div>
  );
};
