const { execSync } = require('child_process');
const path = require('path');

const projectDir = '/home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator';

console.log('Running TypeScript compilation check...');
try {
  process.chdir(projectDir);
  const result = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ No TypeScript errors found!');
  console.log(result);
} catch (error) {
  console.log('❌ TypeScript errors found:');
  console.log(error.stdout);
  console.log(error.stderr);
}

console.log('\nChecking build...');
try {
  const buildResult = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build failed:');
  console.log(error.stdout);
  console.log(error.stderr);
}
