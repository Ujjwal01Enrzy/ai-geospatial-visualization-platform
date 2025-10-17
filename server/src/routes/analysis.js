const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Analysis API endpoint' });
});

router.post('/detect', (req, res) => {
    // TODO: Implement object detection
    res.json({ message: 'Object detection endpoint' });
});

router.post('/change', (req, res) => {
    // TODO: Implement change detection
    res.json({ message: 'Change detection endpoint' });
});

module.exports = router;