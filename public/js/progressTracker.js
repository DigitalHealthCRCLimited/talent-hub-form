/**
 * Progress Tracker Module
 * Handles form progress tracking and auto-save functionality
 */
class ProgressTracker {
    constructor() {
        this.autoSaveTimeout = null;
    }

    /**
     * Initialize progress tracking
     */
    initialize() {
        this.updateProgress();
        this.setupEventListeners();
        this.restoreFormData();
    }

    /**
     * Setup event listeners for form inputs
     */
    setupEventListeners() {
        const form = document.getElementById('dynamicGeneratedForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.addEventListener('change', () => {
                    this.updateProgress();
                    this.autoSaveForm();
                });
            } else {
                input.addEventListener('input', this.debounce(() => {
                    this.updateProgress();
                    this.autoSaveForm();
                }, 300));
            }
        });
    }

    /**
     * Update progress indicator
     */
    updateProgress() {
        const form = document.getElementById('dynamicGeneratedForm');
        if (!form) return;
        
        const fieldGroups = this.getFieldGroups(form);
        const { totalFields, completedFields } = this.calculateCompletion(fieldGroups);
        
        const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
        
        // Progress UI is commented out in current implementation
        // Uncomment these lines if you want to show progress indicators
        /*
        const progressElements = {
            percentage: document.querySelector('.progress-percentage'),
            fill: document.querySelector('.progress-fill'),
            completed: document.querySelector('.fields-completed'),
            total: document.querySelector('.fields-total'),
            container: document.querySelector('.progress-container')
        };
        
        if (progressElements.percentage) {
            progressElements.percentage.textContent = percentage + '%';
            progressElements.fill.style.width = percentage + '%';
            progressElements.completed.textContent = completedFields;
            progressElements.total.textContent = totalFields;
            
            if (percentage === 100) {
                progressElements.container.classList.add('complete');
            } else {
                progressElements.container.classList.remove('complete');
            }
        }
        */
    }

    /**
     * Get field groups (group by name for radio/checkbox)
     */
    getFieldGroups(form) {
        const allFields = form.querySelectorAll('input, select, textarea');
        const fieldGroups = new Map();
        
        allFields.forEach(field => {
            const name = field.name;
            if (!fieldGroups.has(name)) {
                fieldGroups.set(name, []);
            }
            fieldGroups.get(name).push(field);
        });
        
        return fieldGroups;
    }

    /**
     * Calculate completion statistics
     */
    calculateCompletion(fieldGroups) {
        let totalFields = fieldGroups.size;
        let completedFields = 0;
        let completedRequired = 0;
        let totalRequired = 0;
        
        fieldGroups.forEach((fields) => {
            const isRequired = fields.some(f => f.hasAttribute('required'));
            const isCompleted = this.isFieldCompleted(fields);
            
            if (isRequired) totalRequired++;
            
            if (isCompleted) {
                completedFields++;
                if (isRequired) completedRequired++;
            }
        });
        
        return { totalFields, completedFields, totalRequired, completedRequired };
    }

    /**
     * Check if a field or field group is completed
     */
    isFieldCompleted(fields) {
        const field = fields[0];
        
        if (field.type === 'checkbox') {
            return fields.some(f => f.checked);
        } else if (field.type === 'radio') {
            return fields.some(f => f.checked);
        } else {
            return field.value.trim() !== '';
        }
    }

    /**
     * Auto-save form data to localStorage
     */
    autoSaveForm() {
        clearTimeout(this.autoSaveTimeout);
        this.updateAutoSaveIndicator('saving');
        
        this.autoSaveTimeout = setTimeout(() => {
            try {
                const formData = this.getFormData();
                localStorage.setItem('talentHubFormData', JSON.stringify(formData));
                localStorage.setItem('talentHubFormTimestamp', new Date().toISOString());
                this.updateAutoSaveIndicator('saved');
            } catch (error) {
                console.error('Auto-save failed:', error);
                this.updateAutoSaveIndicator('error');
            }
        }, 500);
    }

    /**
     * Get current form data
     */
    getFormData() {
        const form = document.getElementById('dynamicGeneratedForm');
        if (!form) return {};
        
        const formData = new FormData(form);
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
     * Restore form data from localStorage
     */
    restoreFormData() {
        try {
            const savedData = localStorage.getItem('talentHubFormData');
            const savedTimestamp = localStorage.getItem('talentHubFormTimestamp');
            
            if (!savedData) return;
            
            const data = JSON.parse(savedData);
            const form = document.getElementById('dynamicGeneratedForm');
            if (!form) return;
            
            const timestamp = savedTimestamp ? new Date(savedTimestamp).toLocaleString() : 'unknown time';
            const restore = confirm(`Found saved form data from ${timestamp}. Would you like to restore it?`);
            
            if (!restore) {
                localStorage.removeItem('talentHubFormData');
                localStorage.removeItem('talentHubFormTimestamp');
                return;
            }
            
            this.restoreFieldValues(form, data);
            
            setTimeout(() => {
                this.updateProgress();
                if (window.conditionalLogic) {
                    window.conditionalLogic.checkAllConditionalFields();
                }
            }, 100);
            
        } catch (error) {
            console.error('Failed to restore form data:', error);
        }
    }

    /**
     * Restore individual field values
     */
    restoreFieldValues(form, data) {
        Object.keys(data).forEach(key => {
            const value = data[key];
            const fields = form.querySelectorAll(`[name="${key}"]`);
            
            fields.forEach(field => {
                if (field.type === 'checkbox') {
                    field.checked = Array.isArray(value) ? value.includes(field.value) : value === field.value;
                } else if (field.type === 'radio') {
                    field.checked = field.value === value;
                } else {
                    field.value = value;
                }
            });
        });
    }

    /**
     * Update auto-save indicator
     */
    updateAutoSaveIndicator(status) {
        // Auto-save indicator UI is commented out in current implementation
        // Uncomment and modify these lines if you want to show auto-save status
        /*
        const indicator = document.getElementById('autosaveIndicator');
        if (!indicator) return;
        
        const text = indicator.querySelector('.autosave-text');
        indicator.className = 'autosave-indicator ' + status;
        
        switch(status) {
            case 'saving':
                text.textContent = 'Saving...';
                break;
            case 'saved':
                text.textContent = 'All changes saved';
                setTimeout(() => {
                    indicator.className = 'autosave-indicator';
                }, 2000);
                break;
            case 'error':
                text.textContent = 'Save failed';
                break;
        }
        */
    }

    /**
     * Debounce function to limit update frequency
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Export for use in other modules
window.ProgressTracker = ProgressTracker;