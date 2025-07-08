/**
 * Form Submission Module
 * Handles form validation, submission, and server communication
 */
class FormSubmission {
    constructor() {
        this.isSubmitting = false;
    }

    /**
     * Handle form submission
     */
    async handleSubmit(formElement, event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        this.isSubmitting = true;
        
        const submitBtn = formElement.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        this.setSubmitButtonLoading(submitBtn, true);
        
        try {
            const formData = this.getFormData(formElement);
            const isServerAvailable = await this.checkServerHealth();
            
            if (!isServerAvailable) {
                await this.handleOfflineSubmission(formData, formElement);
            } else {
                await this.handleOnlineSubmission(formData, formElement);
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showSubmissionError(error.message);
        } finally {
            this.setSubmitButtonLoading(submitBtn, false, originalText);
            this.isSubmitting = false;
        }
    }

    /**
     * Set submit button loading state
     */
    setSubmitButtonLoading(button, isLoading, originalText = 'Submit Problem Statement') {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="loading-spinner-small"></span> Submitting...';
        } else {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    /**
     * Get form data as object
     */
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    /**
     * Check server health
     */
    async checkServerHealth() {
        try {
            const response = await fetch('/api/health', { 
                method: 'GET',
                mode: 'cors'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Handle offline submission (save to localStorage)
     */
    async handleOfflineSubmission(data, formElement) {
        const submission = {
            ...data,
            submissionId: Date.now().toString(36) + Math.random().toString(36).substr(2),
            submittedAt: new Date().toISOString(),
            status: 'saved_locally'
        };
        
        const savedSubmissions = JSON.parse(localStorage.getItem('talentHubSubmissions') || '[]');
        savedSubmissions.push(submission);
        localStorage.setItem('talentHubSubmissions', JSON.stringify(savedSubmissions));
        
        // Clear form data
        localStorage.removeItem('talentHubFormData');
        localStorage.removeItem('talentHubFormTimestamp');
        
        this.showSubmissionSuccess(submission.submissionId, true);
        
        setTimeout(() => {
            if (confirm('Would you like to submit another problem statement?')) {
                this.resetForm(formElement);
            }
        }, 2000);
    }

    /**
     * Handle online submission (submit to server)
     */
    async handleOnlineSubmission(data, formElement) {
        const response = await fetch('/api/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server not available. Please ensure the server is running.');
        }
        
        const result = await response.json();
        
        if (result.success) {
            if (result.clearLocalStorage) {
                localStorage.removeItem('talentHubFormData');
                localStorage.removeItem('talentHubFormTimestamp');
            }
            
            this.showSubmissionSuccess(result.submissionId);
            
            setTimeout(() => {
                if (confirm('Would you like to submit another problem statement?')) {
                    this.resetForm(formElement);
                }
            }, 2000);
        } else {
            throw new Error(result.error || 'Submission failed');
        }
    }

    /**
     * Reset form after successful submission
     */
    resetForm(formElement) {
        formElement.reset();
        window.scrollTo(0, 0);
    }

    /**
     * Show submission success message
     */
    showSubmissionSuccess(submissionId, isLocalSave = false) {
        const message = document.createElement('div');
        message.className = 'submission-message success';
        message.innerHTML = `
            <div class="message-icon">✓</div>
            <div class="message-content">
                <h3>Submission ${isLocalSave ? 'Saved Locally' : 'Successful'}!</h3>
                <p>${isLocalSave ? 'Your submission has been saved locally.' : 'Your problem statement has been received.'}</p>
                <p class="submission-id">Reference ID: ${submissionId}</p>
                <p>${isLocalSave ? 'It will be submitted when the server is available.' : 'Our AI will process your submission and match you with qualified talent.'}</p>
            </div>
        `;
        
        this.showMessage(message);
    }

    /**
     * Show submission error message
     */
    showSubmissionError(error) {
        const message = document.createElement('div');
        message.className = 'submission-message error';
        message.innerHTML = `
            <div class="message-icon">✗</div>
            <div class="message-content">
                <h3>Submission Failed</h3>
                <p>${error}</p>
                <p>Please check your form and try again.</p>
            </div>
        `;
        
        this.showMessage(message);
    }

    /**
     * Show message with animation
     */
    showMessage(messageElement) {
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => messageElement.remove(), 300);
        }, 5000);
    }
}

// Export for use in other modules
window.FormSubmission = FormSubmission;