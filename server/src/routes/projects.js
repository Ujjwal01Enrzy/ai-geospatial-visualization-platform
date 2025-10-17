const express = require('express');
const router = express.Router();

// Temporary project store (replace with database)
const projects = [];

router.get('/', (req, res) => {
    res.json(projects);
});

router.post('/', (req, res) => {
    const { name, description } = req.body;
    const project = {
        id: Date.now(),
        name,
        description,
        userId: req.user.id
    };
    projects.push(project);
    res.status(201).json(project);
});

router.get('/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
});

module.exports = router;