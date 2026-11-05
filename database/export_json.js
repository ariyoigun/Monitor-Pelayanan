const db = require('./db');
const fs = require('fs');
const path = require('path');

const submissions = db.prepare('SELECT * FROM submissions ORDER BY id DESC').all();
const users = db.prepare('SELECT * FROM users').all();
const visitors = db.prepare('SELECT * FROM visitors').all();
const system_texts = db.prepare('SELECT * FROM system_texts').all();

const backup = {
  version: "2.0.0",
  exported_at: new Date().toISOString(),
  counts: {
    submissions: submissions.length,
    users: users.length,
    visitors: visitors.length,
    system_texts: system_texts.length
  },
  tables: {
    submissions,
    users,
    visitors,
    system_texts
  }
};

const outPath = path.join(__dirname, 'silan_backup.json');
fs.writeFileSync(outPath, JSON.stringify(backup, null, 2), 'utf8');
console.log(`Database exported successfully to ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
