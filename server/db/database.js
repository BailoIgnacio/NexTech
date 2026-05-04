const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
require('dotenv').config();

const dbFile = process.env.DB_FILE || './server/db/data.json';
const adapter = new FileSync(path.resolve(dbFile));
const db = low(adapter);

db.defaults({ products: [] }).write();

module.exports = db;
