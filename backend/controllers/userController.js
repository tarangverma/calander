const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const userExists = await pool.query(
        'SELECT * FROM people WHERE email = $1',
        [email]
      );
      
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Create user
      const result = await pool.query(
        'INSERT INTO people (email, password) VALUES ($1, $2) RETURNING id, email',
        [email, passwordHash]
      );
      
      const user = result.rows[0];
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const result = await pool.query(
        'SELECT * FROM people WHERE email = $1',
        [email]
      );
      
      const user = result.rows[0];
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        user: {
          id: user.id,
          email: user.email
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;
