// scripts/parseInfoFile.js
// Parse the info file and convert to JSON format

const fs = require('fs');
const path = require('path');

console.log('📖 PARSING INFO FILE TO JSON');
console.log('='.repeat(70));
console.log('');

function parseInfoFile() {
  const infoPath = path.join(__dirname, '..', 'info');
  const outputPath = path.join(__dirname, 'universities153.json');
  
  console.log('Reading info file...');
  const content = fs.readFileSync(infoPath, 'utf8');
  
  const lines = content.split('\n');
  const universities = [];
  
  let currentUniversity = null;
  let currentColleges = [];
  let inCollegesSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines at the start
    if (!line && !currentUniversity) continue;
    
    // University line: "1. University: ..."
    if (line.match(/^\d+\.\s+University:/)) {
      // Save previous university if exists
      if (currentUniversity) {
        currentUniversity.colleges = currentColleges;
        universities.push(currentUniversity);
      }
      
      // Extract university name
      const nameMatch = line.match(/University:\s+(.+)$/);
      if (nameMatch) {
        currentUniversity = {
          name: nameMatch[1].trim(),
          country: '',
          colleges: []
        };
        currentColleges = [];
        inCollegesSection = false;
      }
    }
    // Country line: "Country: Egypt"
    else if (line.startsWith('Country:') && currentUniversity) {
      currentUniversity.country = line.replace('Country:', '').trim();
    }
    // Colleges section start
    else if (line.match(/Colleges \(\d+\):/)) {
      inCollegesSection = true;
    }
    // "Colleges: No colleges found"
    else if (line.includes('No colleges found')) {
      currentColleges = [];
      inCollegesSection = false;
    }
    // College item: "1. College name"
    else if (inCollegesSection && line.match(/^\d+\.\s+(.+)$/)) {
      const collegeMatch = line.match(/^\d+\.\s+(.+)$/);
      if (collegeMatch) {
        currentColleges.push({
          collegeName: collegeMatch[1].trim()
        });
      }
    }
  }
  
  // Don't forget the last university
  if (currentUniversity) {
    currentUniversity.colleges = currentColleges;
    universities.push(currentUniversity);
  }
  
  console.log(`✅ Parsed ${universities.length} universities`);
  console.log('');
  
  // Count by country
  const countryCounts = {};
  universities.forEach(uni => {
    countryCounts[uni.country] = (countryCounts[uni.country] || 0) + 1;
  });
  
  console.log('Distribution by country:');
  Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).forEach(([country, count]) => {
    console.log(`  ${country.padEnd(30)} ${count.toString().padStart(3)} universities`);
  });
  
  // Write to JSON file
  console.log('');
  console.log('Writing to universities153.json...');
  fs.writeFileSync(outputPath, JSON.stringify(universities, null, 2), 'utf8');
  
  console.log('✅ Successfully created universities153.json');
  console.log(`📁 Location: ${outputPath}`);
  console.log('');
  console.log('='.repeat(70));
  console.log('🎉 PARSING COMPLETE!');
  console.log('='.repeat(70));
  console.log('');
  console.log('📋 NEXT STEP:');
  console.log('  Run: npm run update:153universities');
  console.log('');
}

try {
  parseInfoFile();
} catch (error) {
  console.error('❌ Error:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
