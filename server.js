const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs'); // Lets the server read files

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' })); // Allows large menu data

// Connect to SQLite Database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database.');

        // Create a table to hold the menu document
        db.run(`CREATE TABLE IF NOT EXISTS menu (
            id INTEGER PRIMARY KEY,
            data TEXT
        )`, () => {
            // MIGRATION TRICK: If the database is empty, copy data from menu.json!
            db.get("SELECT * FROM menu WHERE id = 1", (err, row) => {
                if (!row) {
                    let initialData = '[]';
                    if (fs.existsSync('./menu.json')) {
                        console.log("📦 Found menu.json! Migrating data to SQLite...");
                        initialData = fs.readFileSync('./menu.json', 'utf8');
                    }
                    db.run("INSERT INTO menu (id, data) VALUES (1, ?)", [initialData], (err) => {
                        if (!err) console.log("✅ Data successfully migrated to database!");
                    });
                }
            });
        });
    }
});

// --- THE API BRIDGES ---

// Bridge 1: The website asks for the menu
app.get('/api/menu', (req, res) => {
    db.get("SELECT data FROM menu WHERE id = 1", (err, row) => {
        if (err || !row) {
            res.status(500).json({ error: "Could not fetch menu" });
        } else {
            res.json(JSON.parse(row.data));
        }
    });
});

// Bridge 2: The admin panel sends new edits to save
app.post('/api/menu', (req, res) => {
    const updatedMenuString = JSON.stringify(req.body);

    db.run("UPDATE menu SET data = ? WHERE id = 1", [updatedMenuString], function(err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to save to database" });
        } else {
            res.json({ success: true, message: "Menu successfully updated in SQLite!" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});