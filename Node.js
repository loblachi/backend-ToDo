// server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');  // Import the cors package
const app = express();
const port = 3000;
require('dotenv').config();

app.use(cors({
    origin: 'http://127.0.0.1:5500'  // Allow only this domain
}));
// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',         // Your MySQL username
    password: process.env.DB_PASSWORD, // Your MySQL password
    database: process.env.DB_NAME    // Name of your database
});

// Connect to MySQL
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

// Middleware to parse JSON data
app.use(express.json());

// Route to handle task form data
app.post('/tasks', (req, res) => {
    const { task, description, deadline, is_completed, created_at, priority } = req.body;
     
    const query = `
        INSERT INTO tasks (task, description, deadline, is_completed, created_at, priority)
        VALUES (?, ?, STR_TO_DATE(?, '%Y-%m-%d'), ?, STR_TO_DATE(?, '%Y-%m-%d'), ?);
    `;

    const values = [
        
        task,
        description,
        deadline,
        is_completed ? 1 : 0, // Convert to 1/0 for boolean
        created_at,
        priority ? 1 : 0      // Convert to 1/0 for boolean
    ];

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting data: ' + err.stack);
            return res.status(500).json({ error: 'Error inserting data' });
        }
        res.json({ message: 'Task added successfully', taskId: result.insertId });
    });
});


// the get reques to fetch data from the database to display 
app.get('/get-tasks', (req, res) => {
    const query = 'SELECT * FROM tasks'; 

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

// DELETE request to remove a task by ID
app.delete('/delete-task/:id', (req, res) => {
    const taskId = req.params.id; // Get the task ID from URL parameter

    const query = 'DELETE FROM tasks WHERE id = ?';
    
    connection.query(query, [taskId], (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: `Task with ID ${taskId} deleted successfully` });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
