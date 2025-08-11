# Git History for Anchor Builders ADU Generator\n\n## Full Commit Log\n
* 1c25f9c (HEAD -> main, origin/main) fix: Railway deployment configuration with Express server and nixpacks
* fc0fd14 fix: update package-lock.json with Express dependencies
| *   3c1d8da (refs/stash) WIP on chore/prod-readiness-AUG8-template: b4ab626 fix: update package-lock.json with Express dependencies
| |\  
| | * 2b8aab8 index on chore/prod-readiness-AUG8-template: b4ab626 fix: update package-lock.json with Express dependencies
| |/  
| * b4ab626 (chore/prod-readiness-AUG8-template) fix: update package-lock.json with Express dependencies
| * c88f14c docs: add deployment checklist and update environment examples
| * f8a25fc fix: remove health check from React app Railway config - only PDF service needs it
| * 5914a90 fix(railway): resolve monorepo deployment failures
| * b4eae86 (tag: v3.0-critical-checkpoint) 🚨 CRITICAL CHECKPOINT: All bugs fixed, production-ready state
| * e98650e fix(template): fix milestone timeline vertical line to stop at M7 and center through circles
| * bf16ded fix(critical): ensure enhanced template parameter passed to PDF generator
| * c14b5d4 chore(build): production build verified and UX sanity checklist complete
| * c21b38d docs: production audit, deployment runbook, and env example
| * 9a586e4 chore(audit): add sample PDFs and template screenshot
| * 919e799 chore(ts): clean unused vars/imports and align types for pricing flow
| * 6224896 fix(pdf): embed real Anchor Builders logo via base64 helper
| * 6f78b85 feat(pdf): template resolver wiring ENHANCED-AUG8-CHECKPOINT with fallbacks
| * ebed879 (feature/shadcn-ui-experiment) 🚀 Complete Professional ADU Generator with Enhanced PDF Integration
| | * 08535f8 (feature/internal-layout-redesign) 🎨 DESIGN ITERATION: Enhanced 3D UI with sophisticated visual effects
| | * 7932aa0 (origin/feature/internal-layout-redesign) feat: Complete internal layout redesign with navy blue accents + LA/OC catalog cleanup
| | * 28610c4 Checkpoint before layout redesign
| |/  
|/|   
* | ed2b283 🎯 MAJOR PRICING & MILESTONE FIXES: Complete calculation overhaul
* | a71ee67 feat: Add horizontal timeline + fix critical selectedAddOns sync bug
* | fb2a23f feat: add test data button for rapid PDF testing
* | f541fc2 feat: improve layout and pricing table formatting
* | 247090e feat: redesign header layout for more compact design
* | cacf416 fix: update logo path to use root directory logo file
* | 0cdfafa feat: standardize font sizes to 10px and move pricing table to page 2
|/  
* d9f918d (origin/feature/new-pdf-design, feature/new-pdf-design) feat: add HVAC selection field and enhanced UI components
* 4db4789 feat: create new modern PDF design template with improved UX
* c7add96 checkpoint: stable production deployment with team documentation
* 5c5a615 security: remove .env.backup from repository and add to gitignore
* a6cfa67 feat: deploy enhanced Anchor ADU PDF generator with latest improvements
* dfb6c21 fix: restore PDF template generator and form validation
* d313a04 fix: add missing State field and implement comprehensive improvements
* b304935 feat: implement fully functional View & Edit and Admin Settings
* 70edb95 feat(layout): condense sections to fit on one page
* 6f83be3 fix(timeline): move PROJECT TIMELINE section down 1-2 rows with margin-top
* b885693 feat(pdf): reduce timeline phase image sizes for better A4 fit
* 648b6f3 feat(pdf): reorganize layout - cost breakdown to page 2, timeline to page 3
* 08ee78f feat(pdf): optimize A4 template spacing and layout
* e66879f feat(pdf): optimize template for A4 paper format and eliminate print cutoff
* faaff44 fix: improve PDF print layout to prevent content cutoff
* 306b02f trigger Railway deployment: force rebuild with latest changes
* e496d14 feat: optimize PDF layout for 8.5x11 printing with compact client info
* 365a7b2 feat: add complete PDF template sections - inclusions, exclusions, testing requirements
* 4c49808 feat: replace PDF template with complete HTML design file
* 91be7d9 feat: expand PDF template with complete proposal content
* ac59eb2 feat: move Generate Proposal button to top of form
* 4766bde revert: restore original technical form language
* 0ba792f revert: restore original phone field label from 'Best Phone Number *' to 'Phone *'
* ef275cc feat(ux): improve form language and consolidate contact info
* 942aaaa fix(critical): resolve template literal interpretation errors
* 28ac8cf fix(pdf): resolve template literal ReferenceError causing fallback PDFs
* df3d40e fix(pdf): remove HTML wrapping to preserve modern template design
* c614e8e feat: deploy debug version with comprehensive console logging to troubleshoot blank PDF issue
* 18a6d71 fix(pdf): resolve blank PDF and download issues with embedded template
* 938fc66 chore: remove corrupted TypeScript config files
* 530c852 fix(pdf): implement browser print dialog instead of HTML file downloads
* 291c993 fix(pdf): resolve async/await issues in PDF generation
* 1be6964 feat: modernize ADU proposal system with Google Maps integration
* 695279a feat: improve form layout and functionality
* 7a39c48 feat: implement exact Excel ROUND formula for milestone calculations
* 3307d4a fix: display all 7 payment milestones correctly
* 045be20 fix: add base construction price per sqft to live pricing display
* 73572e7 trigger: force Railway deployment
* 54bcb2e feat: restore base construction price per sqft display
* 0929a1c feat: implement exact Excel milestone payment calculations
* de119d9 feat: implement exact Anchor Builders pricing and template system
* 54843e8 fix: use exact official Anchor Builders logo provided by user
* 95bb8ba feat: update to official Anchor Builders JPEG logo
* 89a59fb feat: add official Anchor Builders logo to application
* 8961252 feat: implement single-page ADU proposal form with real-time pricing
* 3785f2e fix: resolve JSX syntax errors and improve form layout
* bf32b4d fix: improve layout from cramped 3-column to proper 2-column design
* 2b1c625 feat: implement single-page form design
* c14124c chore: optimize repository - remove temp files, unused deps, and add build optimizations
* 6d1f1bf feat: implement professional Excel-matching PDF template system
* 2353f0b fix: remove duplicate pricingEngine declaration causing build failure
* 650e474 fix: correct port assignment to 5000 per CLAUDE.md protocol
* d16c70d fix: update Railway port to 8080 for deployment compatibility
* 532f412 feat: complete UI/UX improvements and milestone payment system
* 8283fae fix: correct design services pricing to $12,500 and add Anchor Builders logo
* f314dcf feat: add sample PDF preview with mock data
* 8648972 feat: implement professional Anchor Builders design system
* dc35cfe feat: add professional PDF generation with enhanced styling
* c39580e feat: update project form to match Excel input fields
* 7bdd955 refactor: simplify pricing engine to match real Anchor Builders Excel model
* 152af08 fix: add Railway host to Vite allowed hosts for production deployment
* 657ba61 Initial commit: Anchor Builders ADU Proposal Generator
\n\n## Important Commits\n
ed2b283 🎯 MAJOR PRICING & MILESTONE FIXES: Complete calculation overhaul
a71ee67 feat: Add horizontal timeline + fix critical selectedAddOns sync bug
247090e feat: redesign header layout for more compact design
d9f918d feat: add HVAC selection field and enhanced UI components
4db4789 feat: create new modern PDF design template with improved UX
c7add96 checkpoint: stable production deployment with team documentation
a6cfa67 feat: deploy enhanced Anchor ADU PDF generator with latest improvements
08ee78f feat(pdf): optimize A4 template spacing and layout
306b02f trigger Railway deployment: force rebuild with latest changes
365a7b2 feat: add complete PDF template sections - inclusions, exclusions, testing requirements
4c49808 feat: replace PDF template with complete HTML design file
0ba792f revert: restore original phone field label from 'Best Phone Number *' to 'Phone *'
28ac8cf fix(pdf): resolve template literal ReferenceError causing fallback PDFs
df3d40e fix(pdf): remove HTML wrapping to preserve modern template design
18a6d71 fix(pdf): resolve blank PDF and download issues with embedded template
1be6964 feat: modernize ADU proposal system with Google Maps integration
045be20 fix: add base construction price per sqft to live pricing display
54bcb2e feat: restore base construction price per sqft display
0929a1c feat: implement exact Excel milestone payment calculations
95bb8ba feat: update to official Anchor Builders JPEG logo
89a59fb feat: add official Anchor Builders logo to application
8961252 feat: implement single-page ADU proposal form with real-time pricing
bf32b4d fix: improve layout from cramped 3-column to proper 2-column design
2b1c625 feat: implement single-page form design
6d1f1bf feat: implement professional Excel-matching PDF template system
532f412 feat: complete UI/UX improvements and milestone payment system
8283fae fix: correct design services pricing to $12,500 and add Anchor Builders logo
f314dcf feat: add sample PDF preview with mock data
8648972 feat: implement professional Anchor Builders design system
dc35cfe feat: add professional PDF generation with enhanced styling
c39580e feat: update project form to match Excel input fields
