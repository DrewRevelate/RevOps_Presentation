// routes/contact-form.js
// Routes for contact form handling

const express = require('express');
const router = express.Router();
const path = require('path');
const { Contact } = require('../models');

// Serve the contact form
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'contact-form.html'));
});

// Process contact form submission
router.post('/submit', async (req, res) => {
    try {
        const contactData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            major: req.body.major,
            gradYear: req.body.gradYear,
            careerGoals: req.body.careerGoals,
            sessionId: req.body.sessionId || '',
            userAgent: req.body.userAgent || req.headers['user-agent'],
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            screen: req.body.screen || ''
        };
        
        const result = await Contact.saveContactSubmission(contactData);
        
        res.json({ success: true, message: 'Thank you for your submission!' });
    } catch (error) {
        console.error('Error processing contact form submission:', error);
        res.status(500).json({ 
            success: false, 
            error: 'There was a problem submitting your information. Please try again.'
        });
    }
});

module.exports = router;