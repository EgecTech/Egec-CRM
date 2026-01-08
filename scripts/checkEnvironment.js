// scripts/checkEnvironment.js
// Run this before deployment to verify all required environment variables

const chalk = require('chalk');

console.log(chalk.bold.blue('\n🔍 Checking Environment Variables...\n'));

const requiredVars = {
  'MONGODB_URI': {
    required: true,
    description: 'MongoDB connection string',
    example: 'mongodb+srv://user:pass@cluster.mongodb.net/dbname'
  },
  'DATABASE_NAME': {
    required: false,
    description: 'MongoDB database name (if not in URI)',
    example: 'egec_crm'
  },
  'NEXTAUTH_URL': {
    required: true,
    description: 'Full URL of your application',
    example: 'https://your-domain.com'
  },
  'NEXTAUTH_SECRET': {
    required: true,
    description: 'Secret key for NextAuth (min 32 characters)',
    example: 'your-secret-key-here-min-32-chars',
    validate: (value) => value.length >= 32
  },
  'REDIS_URL': {
    required: false,
    description: 'Redis connection URL (optional, for caching)',
    example: 'redis://localhost:6379'
  }
};

let allPassed = true;
let warnings = [];

Object.entries(requiredVars).forEach(([key, config]) => {
  const value = process.env[key];
  const exists = !!value;
  
  if (config.required) {
    if (!exists) {
      console.log(chalk.red(`❌ ${key}`));
      console.log(chalk.gray(`   ${config.description}`));
      console.log(chalk.gray(`   Example: ${config.example}\n`));
      allPassed = false;
    } else {
      // Validate if validator exists
      if (config.validate && !config.validate(value)) {
        console.log(chalk.yellow(`⚠️  ${key}`));
        console.log(chalk.gray(`   Value exists but validation failed`));
        console.log(chalk.gray(`   ${config.description}\n`));
        warnings.push(key);
      } else {
        console.log(chalk.green(`✅ ${key}`));
        // Don't print actual value for security
        console.log(chalk.gray(`   Value: ${'*'.repeat(20)}\n`));
      }
    }
  } else {
    if (!exists) {
      console.log(chalk.yellow(`⚠️  ${key} (optional)`));
      console.log(chalk.gray(`   ${config.description}`));
      console.log(chalk.gray(`   Example: ${config.example}\n`));
      warnings.push(key);
    } else {
      console.log(chalk.green(`✅ ${key} (optional)`));
      console.log(chalk.gray(`   Value: ${'*'.repeat(20)}\n`));
    }
  }
});

console.log(chalk.bold('\n📊 Summary:\n'));

if (allPassed && warnings.length === 0) {
  console.log(chalk.green.bold('✅ All checks passed! Ready for deployment.\n'));
  process.exit(0);
} else if (allPassed && warnings.length > 0) {
  console.log(chalk.yellow.bold(`⚠️  All required variables set, but ${warnings.length} optional variable(s) missing:`));
  warnings.forEach(w => console.log(chalk.yellow(`   - ${w}`)));
  console.log(chalk.yellow('\nYou can proceed, but consider adding these for better functionality.\n'));
  process.exit(0);
} else {
  console.log(chalk.red.bold('❌ Missing required environment variables!'));
  console.log(chalk.red('Please set the missing variables before deployment.\n'));
  console.log(chalk.gray('Create a .env.local file with the required variables or set them in your deployment platform.\n'));
  process.exit(1);
}
