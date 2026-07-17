const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const sourcePath = process.argv[2] || path.join("data", "app.sqlite");
const outputPath = process.argv[3];

if (!outputPath) {
  throw new Error("Usage: node scripts/export-sqlite-to-d1.js <source.sqlite> <output.sql>");
}

const db = new Database(sourcePath, { readonly: true });
const rows = db.prepare("SELECT * FROM items ORDER BY id").all();
db.close();

const quote = (value) => value === null || value === undefined
  ? "NULL"
  : `'${String(value).replaceAll("'", "''")}'`;

const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
const statements = ["DELETE FROM items;"];

for (const row of rows) {
  statements.push(`INSERT INTO items (${columns.join(", ")}) VALUES (${columns.map((column) => quote(row[column])).join(", ")});`);
}

fs.writeFileSync(outputPath, `${statements.join("\n")}\n`, "utf8");
console.log(`Exported ${rows.length} items.`);
