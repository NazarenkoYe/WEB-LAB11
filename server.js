const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

// Перевірка ID
function validateId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
}

// GET - отримання всіх студентів
app.get('/api/students', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM students ORDER BY id'
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('GET students error:', err.message);
        res.status(500).json({
            error: 'Error retrieving students'
        });
    }
});

// GET - отримання студента за ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateId(id)) {
            return res.status(400).json({
                error: 'Invalid student ID'
            });
        }

        const result = await pool.query(
            'SELECT * FROM students WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('GET student error:', err.message);
        res.status(500).json({
            error: 'Error retrieving student'
        });
    }
});

// POST - додавання нового студента
app.post('/api/students', async (req, res) => {
    try {
        const { name, age, major } = req.body;

        if (
            typeof name !== 'string' || !name.trim() ||
            !Number.isInteger(age) || age <= 0 ||
            typeof major !== 'string' || !major.trim()
        ) {
            return res.status(400).json({
                error: 'Name, positive integer age and major are required'
            });
        }

        const result = await pool.query(
            `INSERT INTO students (name, age, major)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name.trim(), age, major.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST student error:', err.message);
        res.status(500).json({
            error: 'Error creating student'
        });
    }
});

// PUT - оновлення студента
app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, major } = req.body;

        if (!validateId(id)) {
            return res.status(400).json({
                error: 'Invalid student ID'
            });
        }

        if (
            typeof name !== 'string' || !name.trim() ||
            !Number.isInteger(age) || age <= 0 ||
            typeof major !== 'string' || !major.trim()
        ) {
            return res.status(400).json({
                error: 'Name, positive integer age and major are required'
            });
        }

        const result = await pool.query(
            `UPDATE students
             SET name = $1, age = $2, major = $3
             WHERE id = $4
             RETURNING *`,
            [name.trim(), age, major.trim(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('PUT student error:', err.message);
        res.status(500).json({
            error: 'Error updating student'
        });
    }
});

// DELETE - видалення студента
app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateId(id)) {
            return res.status(400).json({
                error: 'Invalid student ID'
            });
        }

        const result = await pool.query(
            'DELETE FROM students WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Student not found'
            });
        }

        res.status(200).json({
            message: 'Student deleted successfully',
            student: result.rows[0]
        });
    } catch (err) {
        console.error('DELETE student error:', err.message);
        res.status(500).json({
            error: 'Error deleting student'
        });
    }
});

// Запуск сервера після перевірки підключення до БД
async function startServer() {
    try {
        await pool.query('SELECT NOW()');

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log('Connected to PostgreSQL database');
        });
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
}

startServer();
