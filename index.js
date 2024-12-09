const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const db = require('./db');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(bodyParser.json());

app.use('/users/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// GET /users - Get all users
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// GET /users/:email - Get a user by email
app.get('/users/:email', (req, res) => {
  db.get('SELECT * FROM users WHERE email = ?', [req.params.email], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(404).send('User not found');
    res.json(row);
  });
});

// POST /users - Create a new user
app.post('/users', (req, res) => {
  const { email, firstName, lastName, class: userClass } = req.body;
  db.run(
    'INSERT INTO users (email, firstName, lastName, class) VALUES (?, ?, ?, ?)',
    [email, firstName, lastName, userClass],
    (err) => {
      if (err) return res.status(400).send('User already exists or invalid input');
      res.status(201).send('User created successfully');
    }
  );
});

// PUT /users/:email - Update a user
app.put('/users/:email', (req, res) => {
  const {firstName, lastName, class: userClass } = req.body;
  db.run(
    'UPDATE users SET firstName = ?, lastName = ?, class = ? WHERE email = ?',
    [firstName, lastName, userClass, req.params.email],
    function (err) {
      if (err) return res.status(500).send(err.message);
      if (this.changes === 0) return res.status(404).send('User not found');
      res.send('User updated successfully');
    }
  );
});

// DELETE /users/:email - Delete a user
app.delete('/users/:email', (req, res) => {
  db.run('DELETE FROM users WHERE email = ?', [req.params.email], function (err) {
    if (err) return res.status(500).send(err.message);
    if (this.changes === 0) return res.status(404).send('User not found');
    res.send('User deleted successfully');
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));