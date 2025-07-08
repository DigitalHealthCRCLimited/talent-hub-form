/**
 * UI Manager Module
 * Handles UI interactions, section management, and conditional logic
 */
class UIManager {
    constructor() {
        this.collapsedSections = [];
    }

    /**
     * Toggle section collapse/expand
     */
    toggleSection(sectionId) {
        const section = document.querySelector(`[data-section-id="${sectionId}"]`);
        const content = document.getElementById(sectionId);
        
        if (!section || !content) return;
        
        if (section.classList.contains('collapsed')) {
            this.expandSection(section, content);
        } else {
            this.collapseSection(section, content);
        }
        
        this.saveCollapseState();
    }

    /**
     * Expand a single section
     */
    expandSection(section, content) {
        section.classList.remove('collapsed');
        content.style.maxHeight = content.scrollHeight + 'px';
        setTimeout(() => {
            content.style.maxHeight = 'none';
        }, 300);
    }

    /**
     * Collapse a single section
     */
    collapseSection(section, content) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.offsetHeight; // Force reflow
        content.style.maxHeight = '0';
        section.classList.add('collapsed');
    }

    /**
     * Expand all sections
     */
    expandAllSections() {
        document.querySelectorAll('.section.collapsible').forEach(section => {
            section.classList.remove('collapsed');
            const content = section.querySelector('.section-content');
            content.style.maxHeight = 'none';
        });
        this.saveCollapseState();
    }

    /**
     * Collapse all sections
     */
    collapseAllSections() {
        document.querySelectorAll('.section.collapsible').forEach(section => {
            section.classList.add('collapsed');
            const content = section.querySelector('.section-content');
            content.style.maxHeight = '0';
        });
        this.saveCollapseState();
    }

    /**
     * Save collapse state to localStorage
     */
    saveCollapseState() {
        const collapsedSections = [];
        document.querySelectorAll('.section.collapsible.collapsed').forEach(section => {
            collapsedSections.push(section.getAttribute('data-section-id'));
        });
        localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
    }

    /**
     * Restore collapse state from localStorage
     */
    restoreCollapseState() {
        const savedState = localStorage.getItem('collapsedSections');

        if (savedState === null) {
            // If no state is saved, collapse all sections by default on first load.
            this.collapseAllSections();
        } else {
            // Restore the saved state from localStorage.
            const collapsedSections = JSON.parse(savedState);
            collapsedSections.forEach(sectionId => {
                const section = document.querySelector(`[data-section-id="${sectionId}"]`);
                if (section) {
                    section.classList.add('collapsed');
                    const content = document.getElementById(sectionId);
                    if (content) {
                        content.style.maxHeight = '0';
                    }
                }
            });
        }
    }

    /**
     * Show loading message
     */
    showLoading() {
        const loadingElement = document.getElementById('loadingMessage');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    /**
     * Hide loading message
     */
    hideLoading() {
        const loadingElement = document.getElementById('loadingMessage');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * Show form
     */
    showForm() {
        const formElement = document.getElementById('dynamicForm');
        if (formElement) {
            formElement.style.display = 'block';
        }
    }

    /**
     * Show error message
     */
    showError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.style.display = 'block';
        }
    }

    /**
     * Hide error message
     */
    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

/**
 * Conditional Logic Manager
 * Handles conditional field display logic
 */
class ConditionalLogic {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * Setup conditional logic event listeners
     */
    setupEventListeners() {
        const form = document.getElementById('dynamicGeneratedForm');
        if (!form) return;

        const allInputs = form.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.addEventListener('change', (event) => this.handleFieldChange(event));
        });

        this.checkAllConditionalFields();
    }

    /**
     * Handle field changes for conditional logic
     */
    handleFieldChange(event) {
        const changedField = event.target;
        const fieldName = changedField.name;
        
        const dependentFields = document.querySelectorAll(`[data-depends-on="${fieldName}"]`);
        
        dependentFields.forEach(field => {
            this.checkConditionalField(field, changedField);
        });
        
        // Field changes applied (progress tracking disabled)";
    }

    /**
     * Check conditional field visibility
     */
    checkConditionalField(fieldElement, triggerField) {
        const dependsOnValues = fieldElement.getAttribute('data-depends-values').split('|');
        const triggerValue = this.getFieldValue(triggerField);
        
        const shouldShow = dependsOnValues.includes(triggerValue);
        
        if (shouldShow) {
            this.showField(fieldElement);
        } else {
            this.hideField(fieldElement);
        }
    }

    /**
     * Show conditional field with animation
     */
    showField(fieldElement) {
        fieldElement.style.display = 'block';
        fieldElement.style.opacity = '0';
        fieldElement.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            fieldElement.style.transition = 'all 0.3s ease';
            fieldElement.style.opacity = '1';
            fieldElement.style.transform = 'translateY(0)';
        }, 10);
    }

    /**
     * Hide conditional field with animation
     */
    hideField(fieldElement) {
        fieldElement.style.transition = 'all 0.3s ease';
        fieldElement.style.opacity = '0';
        fieldElement.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            fieldElement.style.display = 'none';
            this.clearFieldValue(fieldElement);
        }, 300);
    }

    /**
     * Get field value (handles different input types)
     */
    getFieldValue(field) {
        if (field.type === 'radio') {
            const checkedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
            return checkedRadio ? checkedRadio.value : '';
        } else if (field.type === 'checkbox') {
            const checkedBoxes = document.querySelectorAll(`input[name="${field.name}"]:checked`);
            return Array.from(checkedBoxes).map(cb => cb.value).join('|');
        } else {
            return field.value;
        }
    }

    /**
     * Clear field values when hidden
     */
    clearFieldValue(fieldElement) {
        const inputs = fieldElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }

    /**
     * Check all conditional fields on initialization
     */
    checkAllConditionalFields() {
        const conditionalFields = document.querySelectorAll('[data-depends-on]');
        
        conditionalFields.forEach(field => {
            const dependsOnFieldName = field.getAttribute('data-depends-on');
            const triggerField = document.querySelector(`[name="${dependsOnFieldName}"]`);
            
            if (triggerField) {
                this.checkConditionalField(field, triggerField);
            }
        });
    }
}

// Export for use in other modules
window.UIManager = UIManager;
window.ConditionalLogic = ConditionalLogic;