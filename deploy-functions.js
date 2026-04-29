const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Supabase Edge Functions...');

// Check if supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Supabase CLI not found. Please install it first:');
  console.error('npm install -g supabase');
  process.exit(1);
}

// Check if we're in a Supabase project
if (!fs.existsSync('supabase/config.toml')) {
  console.error('❌ Not in a Supabase project directory');
  process.exit(1);
}

// Deploy functions
const functionsDir = path.join('supabase', 'functions');
const functions = fs.readdirSync(functionsDir).filter(dir =>
  fs.statSync(path.join(functionsDir, dir)).isDirectory()
);

console.log(`📦 Found ${functions.length} functions: ${functions.join(', ')}`);

functions.forEach(func => {
  console.log(`\n🔄 Deploying function: ${func}`);
  try {
    execSync(`supabase functions deploy ${func}`, { stdio: 'inherit' });
    console.log(`✅ Function ${func} deployed successfully`);
  } catch (error) {
    console.error(`❌ Failed to deploy function ${func}:`, error.message);
    process.exit(1);
  }
});

console.log('\n🎉 All functions deployed successfully!');
console.log('\n📝 Next steps:');
console.log('1. Make sure your Supabase project has the required environment variables');
console.log('2. Test the functions in your application');