const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Temporary user store (replace with database)
const users = [];

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    // Add basic validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Store user (replace with database storage)
    users.push({ email, password });

    res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find user (replace with database query)
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );

    res.json({ token });
});

module.exports = router;