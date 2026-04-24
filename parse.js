const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));

data.filter(d => d.errorCount > 0 || d.warningCount > 0).forEach(d => {
  console.log('\n--- ' + d.filePath);
  d.messages.forEach(m => {
    if (d.source && m.line) {
      console.log(`Line ${m.line}: ${d.source.split('\n')[m.line - 1]}`);
    }
  });
});
