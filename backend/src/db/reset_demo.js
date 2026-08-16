// Intercept console.log to provide exactly the required output and silence the verbose SQL logs
const originalLog = console.log;
console.log = (msg) => {
  if (typeof msg === 'string') {
    if (msg.includes('Dropping existing')) {
      // Already printed the first line
      originalLog('Resetting demo database...');
    } else if (msg.includes('Creating schema')) {
      originalLog('Schema restored...');
    } else if (msg.includes('Inserting seed data')) {
      originalLog('Demo data seeded...');
    } else if (msg.includes('Realistic academic seed data inserted successfully.')) {
      originalLog('Demo reset complete.');
    }
    // All other logs (including verbose SQL queries) are intentionally silenced
  }
};

const { seedDB } = require('./seed');

try {
  // Uses existing DB connection, schema creation, and seed logic
  seedDB();
} catch (err) {
  console.log = originalLog;
  console.error('Failed to reset demo database:', err);
  process.exit(1);
}

// Restore console.log
console.log = originalLog;
