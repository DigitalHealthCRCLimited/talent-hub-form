const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Create submissions directory if it doesn't exist
const submissionsDir = path.join(__dirname, 'submissions');
fs.mkdir(submissionsDir, { recursive: true }).catch(console.error);

// Form submission endpoint
app.post('/api/submit-form', async (req, res) => {
    try {
        const formData = req.body;
        
        // Validate required fields
        const requiredFields = [
            'organizationcompanyname',
            'coreproblemstatement',
            'targetaudiencebeneficiaries',
            'problemcategory',
            'desiredoutputsdeliverables',
            'successmetrics',
            'projectstartdate',
            'projectduration',
            'urgencylevel',
            'budgetrange',
            'paymentstructure',
            'workmode',
            'communicationfrequency',
            'experiencelevelrequired'
        ];
        
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                missingFields
            });
        }
        
        // Add submission metadata
        const submission = {
            ...formData,
            submissionId: Date.now().toString(36) + Math.random().toString(36).substr(2),
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        // Save to file (in production, save to database)
        const filename = `submission-${submission.submissionId}.json`;
        await fs.writeFile(
            path.join(submissionsDir, filename),
            JSON.stringify(submission, null, 2)
        );
        
        // Also append to CSV for easy viewing
        await appendToCSV(submission);
        
        // Clear saved form data on successful submission
        res.json({
            success: true,
            message: 'Form submitted successfully',
            submissionId: submission.submissionId,
            clearLocalStorage: true
        });
        
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process submission'
        });
    }
});

// Append submission to CSV
async function appendToCSV(submission) {
    const csvPath = path.join(submissionsDir, 'submissions.csv');
    
    try {
        // Check if CSV exists
        const exists = await fs.access(csvPath).then(() => true).catch(() => false);
        
        if (!exists) {
            // Create CSV with headers
            const headers = Object.keys(submission).join(',') + '\n';
            await fs.writeFile(csvPath, headers);
        }
        
        // Append data
        const values = Object.values(submission).map(v => 
            typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
        ).join(',') + '\n';
        
        await fs.appendFile(csvPath, values);
    } catch (error) {
        console.error('CSV write error:', error);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Form available at http://localhost:${PORT}/index.html`);
    console.log(`Submissions will be saved to: ${submissionsDir}`);
});