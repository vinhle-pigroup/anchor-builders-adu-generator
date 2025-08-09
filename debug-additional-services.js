// Debug script to trace Additional Services issue
// Run this in browser console when generating PDF

console.group('🔍 ADDITIONAL SERVICES DEBUG');

// Check if template has the conditional block
const htmlContent = document.documentElement.innerHTML;
console.log('Template contains {{#if ADD_ON_WORK_EXISTS}}:', htmlContent.includes('{{#if ADD_ON_WORK_EXISTS}}'));
console.log('Template contains {{ADDITIONAL_SERVICES_TOTAL}}:', htmlContent.includes('{{ADDITIONAL_SERVICES_TOTAL}}'));
console.log('Template contains "Additional Services Total":', htmlContent.includes('Additional Services Total'));

// Look for Phase 3 section
const phase3Elements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent.includes('Phase 3') || el.textContent.includes('Additional Services')
);
console.log('Phase 3 elements found:', phase3Elements.length);
phase3Elements.forEach(el => {
    console.log('- Element:', el.tagName, el.className, el.textContent.substring(0, 50));
});

// Look for any additional service rows
const serviceRows = document.querySelectorAll('.additional-service, [class*="additional"]');
console.log('Additional service rows found:', serviceRows.length);
serviceRows.forEach(row => {
    console.log('- Row:', row.textContent.trim());
});

// Check for the subtotal row
const subtotalRows = Array.from(document.querySelectorAll('tr')).filter(tr => 
    tr.textContent.includes('Additional Services Total')
);
console.log('Subtotal rows found:', subtotalRows.length);
subtotalRows.forEach(row => {
    console.log('- Subtotal row:', row.textContent.trim());
});

// Check if there are any unreplaced template variables
const unreplacedVars = htmlContent.match(/{{[^}]+}}/g);
if (unreplacedVars) {
    console.warn('⚠️ Unreplaced template variables found:', unreplacedVars);
}

console.groupEnd();

// Function to check what's in the final HTML
function checkFinalHTML() {
    const tables = document.querySelectorAll('table');
    tables.forEach((table, idx) => {
        console.group(`Table ${idx + 1}`);
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, rowIdx) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const text = Array.from(cells).map(c => c.textContent.trim()).join(' | ');
                if (text.toLowerCase().includes('additional') || text.includes('Phase 3')) {
                    console.log(`Row ${rowIdx}:`, text);
                }
            }
        });
        console.groupEnd();
    });
}

// Export for use
window.debugAdditionalServices = {
    checkTemplate: () => {
        return {
            hasConditional: htmlContent.includes('{{#if ADD_ON_WORK_EXISTS}}'),
            hasTotal: htmlContent.includes('{{ADDITIONAL_SERVICES_TOTAL}}'),
            hasPhase3: htmlContent.includes('Phase 3'),
            unreplacedVars: htmlContent.match(/{{[^}]+}}/g)
        };
    },
    checkFinalHTML: checkFinalHTML
};