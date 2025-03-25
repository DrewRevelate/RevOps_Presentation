// routes/api.js
// API routes for the presentation

const express = require('express');
const router = express.Router();
const { Poll, Contact } = require('../models');

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Poll endpoints
// Get poll data
router.get('/polls/:pollId', async (req, res) => {
    try {
        const pollId = req.params.pollId;
        const userId = req.query.userId || '';
        
        // Always return poll as active
        const pollData = {
            success: true,
            poll: {
                id: pollId,
                isActive: true // Always set to active
            },
            hasVoted: false
        };
        
        // Check if user already voted
        if (userId) {
            const hasVoted = await Poll.hasUserVoted(pollId, userId);
            pollData.hasVoted = hasVoted;
        }
        
        // Get poll results
        const results = await Poll.getPollResults(pollId);
        pollData.results = results;
        
        res.json(pollData);
    } catch (error) {
        console.error('Error fetching poll data:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve poll data' });
    }
});

// Submit poll response
router.post('/polls/:pollId', async (req, res) => {
    try {
        const pollId = req.params.pollId;
        const { votes, userId, slideId, userAgent, screen } = req.body;
        
        // Check if user already voted
        if (userId) {
            const hasVoted = await Poll.hasUserVoted(pollId, userId);
            if (hasVoted) {
                return res.json({ 
                    success: true,
                    alreadyVoted: true,
                    results: await Poll.getPollResults(pollId)
                });
            }
        }
        
        // Save the response
        await Poll.savePollResponse(pollId, userId, votes, {
            slideId,
            userAgent,
            screen
        });
        
        // Get updated results
        const results = await Poll.getPollResults(pollId);
        
        res.json({ success: true, results });
    } catch (error) {
        console.error('Error saving poll response:', error);
        res.status(500).json({ success: false, error: 'Failed to save response' });
    }
});

// Contact form endpoints
router.post('/contact', async (req, res) => {
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
        
        res.json({ success: true, message: 'Contact information saved successfully' });
    } catch (error) {
        console.error('Error saving contact information:', error);
        res.status(500).json({ success: false, error: 'Failed to save contact information' });
    }
});

module.exports = router;