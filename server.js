const express = require('express');
const mysql = require('mysql2');
const inputCheck = require('./utils/inputCheck');

require('dotenv').config();
let db_user = process.env.DB_USER;
let db_pw = process.env.DB_PASSWORD;

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: db_user,
        password: db_pw,
        database: 'election'
    },
    console.log('Connected to the election database.')
)
// Get all candidates
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                 AS party_name
                 FROM candidates
                 LEFT JOIN parties
                 ON candidates.party_id = parties.id`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// GET a single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                 AS party_name
                 FROM candidates
                 LEFT JOIN parties
                 ON candidates.party_id = parties.id
                 WHERE candidates.id =?`;
    const params = [req.params.id];

    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected, party_id)
            VALUES (?,?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected, body.party_id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body,
            changes: result.affectedRows
        });
    });
});

// Update a candidate's party
app.put('/api/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `UPDATE candidates SET party_id = ?
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            // check if a record was found
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});

// Delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.statusMessage(400).json({ error: res.message });
        } else if (!result.affectRows) {
            res.json({
                message: `Candidate not found`
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// GET all parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// GET a single party
app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: `success`,
            data: row
        });
    });
});

// Delete a party
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE ID = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: res.message  });
            // check if anything was deleted
        } else if (!result.affectedRow) {
            res.json({
                message: 'Party not found'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
})

// Listener
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

/*
// Start server after DB connection
db.connect(err => {
  if (err) throw err;
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
*/