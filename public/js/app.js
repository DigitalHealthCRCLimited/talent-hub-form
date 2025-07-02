/**
 * Main Application Controller
 * Orchestrates all modules and handles application initialization
 */
class TalentHubApp {
    constructor() {
        this.formGenerator = new FormGenerator();
        this.formSubmission = new FormSubmission();
        this.progressTracker = new ProgressTracker();
        this.uiManager = new UIManager();
        this.conditionalLogic = null; // Will be initialized after form is generated
        
        // Make instances globally available for backwards compatibility
        window.formGenerator = this.formGenerator;
        window.formSubmission = this.formSubmission;
        window.progressTracker = this.progressTracker;
        window.uiManager = this.uiManager;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            this.uiManager.showLoading();
            this.uiManager.hideError();
            
            // Load form configuration and generate form
            const formData = await this.formGenerator.loadFormConfig();
            const formHTML = this.formGenerator.generateForm(formData);
            
            // Insert form into DOM
            const formContainer = document.getElementById('dynamicForm');
            formContainer.innerHTML = formHTML;
            
            // Setup form submission handler
            this.setupFormSubmissionHandler();
            
            // Initialize other modules
            this.conditionalLogic = new ConditionalLogic();
            window.conditionalLogic = this.conditionalLogic;
            
            this.progressTracker.initialize();
            this.uiManager.restoreCollapseState();
            
            // Show form and hide loading
            this.uiManager.hideLoading();
            this.uiManager.showForm();
            
            console.log('Talent Hub App initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.uiManager.hideLoading();
            this.uiManager.showError();
        }
    }

    /**
     * Setup form submission event handler
     */
    setupFormSubmissionHandler() {
        const form = document.getElementById('dynamicGeneratedForm');
        if (form) {
            form.addEventListener('submit', (event) => {
                this.formSubmission.handleSubmit(form, event);
            });
        }
    }

    /**
     * Reset application state
     */
    reset() {
        // Clear localStorage
        localStorage.removeItem('talentHubFormData');
        localStorage.removeItem('talentHubFormTimestamp');
        localStorage.removeItem('collapsedSections');
        
        // Reset form
        const form = document.getElementById('dynamicGeneratedForm');
        if (form) {
            form.reset();
        }
        
        // Update progress
        this.progressTracker.updateProgress();
        
        console.log('Application state reset');
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            formGenerated: !!document.getElementById('dynamicGeneratedForm'),
            hasFormData: !!localStorage.getItem('talentHubFormData'),
            isFormVisible: document.getElementById('dynamicForm').style.display !== 'none'
        };
    }
}

/**
 * Application initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    // Create and initialize the application
    window.talentHubApp = new TalentHubApp();
    window.talentHubApp.initialize();
});

/**
 * Global utility functions for backwards compatibility
 * These functions delegate to the appropriate module methods
 */

// Form generation functions
window.parseCSV = function(csvText) {
    return window.formGenerator.parseCSV(csvText);
};

window.generateForm = function(formData) {
    const formHTML = window.formGenerator.generateForm(formData);
    const formContainer = document.getElementById('dynamicForm');
    formContainer.innerHTML = formHTML;
    
    // Re-initialize modules after form generation
    if (window.conditionalLogic) {
        window.conditionalLogic.setupEventListeners();
    }
    window.progressTracker.initialize();
};

// Form submission functions
window.handleFormSubmit = function(event) {
    const form = document.getElementById('dynamicGeneratedForm');
    if (form && window.formSubmission) {
        window.formSubmission.handleSubmit(form, event);
    }
};

window.checkServerHealth = function() {
    return window.formSubmission.checkServerHealth();
};

// Progress and auto-save functions
window.initializeProgress = function() {
    window.progressTracker.initialize();
};

window.updateProgress = function() {
    window.progressTracker.updateProgress();
};

window.autoSaveForm = function() {
    window.progressTracker.autoSaveForm();
};

window.restoreFormData = function() {
    window.progressTracker.restoreFormData();
};

// UI management functions
window.toggleSection = function(sectionId) {
    window.uiManager.toggleSection(sectionId);
};

window.expandAllSections = function() {
    window.uiManager.expandAllSections();
};

window.collapseAllSections = function() {
    window.uiManager.collapseAllSections();
};

window.restoreCollapseState = function() {
    window.uiManager.restoreCollapseState();
};

// Conditional logic functions
window.setupConditionalLogic = function() {
    if (window.conditionalLogic) {
        window.conditionalLogic.setupEventListeners();
    }
};

window.checkAllConditionalFields = function() {
    if (window.conditionalLogic) {
        window.conditionalLogic.checkAllConditionalFields();
    }
};

window.handleFieldChange = function(event) {
    if (window.conditionalLogic) {
        window.conditionalLogic.handleFieldChange(event);
    }
};