const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
require("dotenv").config();

const dbFile = process.env.DB_FILE || "./data/tbmi.sqlite";

// create data folder if it doesn't exist
const dir = dbFile.substring(0, dbFile.lastIndexOf("/"));
if (dir && !fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new sqlite3.Database(dbFile);

function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bmi_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        height_cm REAL NOT NULL,
        weight_kg REAL NOT NULL,
        bmi REAL NOT NULL,
        category TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  });
}

module.exports = { db, initDb };
