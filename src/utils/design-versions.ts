/**
 * Design Version Manager
 * Quick access to different layout versions
 */

export interface DesignVersion {
  id: string;
  name: string;
  description: string;
  created: string;
  components: string[];
  gitTag?: string;
  backupPath?: string;
}

export const designVersions: DesignVersion[] = [
  {
    id: 'aug10-4card',
    name: 'August 10 Professional Layout',
    description: '4-card layout in 2x2 grid with 3-column structure (HeaderProgressBar + Cards + Sidebar)',
    created: '2025-08-10 12:00-12:01 AM',
    components: [
      'EnhancedProductionGrid.tsx',
      'HeaderProgressBar.tsx', 
      'SidebarWithPricing.tsx',
      'CompactPricingSidebar.tsx',
      'DesktopCardSelector.tsx'
    ],
    gitTag: 'design-v1-aug10-4card-layout',
    backupPath: '/src/design-backups/2025-08-10-late-night-session/'
  }
];

export const getCurrentDesignVersion = (): DesignVersion => {
  return designVersions[0]; // August 10 is currently active
};

export const getDesignByTag = (tag: string): DesignVersion | undefined => {
  return designVersions.find(v => v.gitTag === tag);
};

/**
 * Design restoration commands for CLAUDE.md reference
 */
export const restorationCommands = {
  august10: 'git checkout design-v1-aug10-4card-layout',
  viewBackups: 'ls -la /home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator/src/design-backups/',
  currentComponents: [
    'EnhancedProductionGrid.tsx - Main 4-card layout',
    'HeaderProgressBar.tsx - Top progress tracking',
    'SidebarWithPricing.tsx - Right sidebar wrapper', 
    'CompactPricingSidebar.tsx - Full pricing breakdown',
    'useAutoSave.tsx - Auto-save functionality',
    'SuccessNotification.tsx - User feedback',
    'ProposalsListPage.tsx - Saved proposals'
  ]
};