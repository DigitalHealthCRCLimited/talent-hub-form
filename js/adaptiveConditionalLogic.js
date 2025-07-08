/**
 * Adaptive Conditional Logic Manager
 * Handles two-dimensional conditional field display logic based on complexity and project type
 */
class AdaptiveConditionalLogic {
    constructor() {
        this.complexityCalculator = new ComplexityCalculator();
        this.formData = null;
        this.currentComplexity = "simple";
        this.currentProjectType = "strategic";
        this.setupEventListeners();
    }

    /**
     * Initialize with form data from CSV
     * @param {Array} formData - Array of field configurations from CSV
     */
    initialize(formData) {
        this.formData = formData;
        this.evaluateCurrentState();
        this.applyConditionalLogic();
    }

    /**
     * Setup event listeners for adaptive logic
     */
    setupEventListeners() {
        const form = document.getElementById('dynamicGeneratedForm');
        if (!form) return;

        // Listen for changes to budget, duration, and problem category
        const budgetField = form.querySelector('[name="budgetrange"]');
        const durationField = form.querySelector('[name="projectduration"]');
        const categoryField = form.querySelector('[name="problemcategory"]');

        if (budgetField) {
            budgetField.addEventListener('change', () => this.handleComplexityChange());
        }
        if (durationField) {
            durationField.addEventListener('change', () => this.handleComplexityChange());
        }
        if (categoryField) {
            categoryField.addEventListener('change', () => this.handleProjectTypeChange());
        }

        // Also handle traditional conditional logic
        const allInputs = form.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.addEventListener('change', (event) => this.handleFieldChange(event));
        });
    }

    /**
     * Handle complexity changes (budget or duration)
     */
    handleComplexityChange() {
        const previousComplexity = this.currentComplexity;
        this.evaluateCurrentState();
        
        if (previousComplexity !== this.currentComplexity) {
            console.log(`Complexity changed from ${previousComplexity} to ${this.currentComplexity}`);
            this.applyConditionalLogic();
            this.logCurrentState();
        }
    }

    /**
     * Handle project type changes
     */
    handleProjectTypeChange() {
        const previousType = this.currentProjectType;
        this.evaluateCurrentState();
        
        if (previousType !== this.currentProjectType) {
            console.log(`Project type changed from ${previousType} to ${this.currentProjectType}`);
            this.applyConditionalLogic();
            this.logCurrentState();
        }
    }

    /**
     * Evaluate current complexity and project type from form
     */
    evaluateCurrentState() {
        const form = document.getElementById('dynamicGeneratedForm');
        if (!form) return;

        this.currentComplexity = this.complexityCalculator.getComplexityFromForm(form);
        this.currentProjectType = this.complexityCalculator.getProjectTypeFromForm(form);
    }

    /**
     * Apply conditional logic to all fields
     */
    applyConditionalLogic() {
        if (!this.formData) return;

        this.formData.forEach(fieldConfig => {
            const fieldElement = this.findFieldElement(fieldConfig.form_label);
            if (fieldElement) {
                this.applyFieldLogic(fieldElement, fieldConfig);
            }
        });

        // Hide empty sections after applying field logic
        this.manageSectionVisibility();

        // Logic updated (progress tracking disabled)
    }

    /**
     * Apply logic to a specific field
     * @param {HTMLElement} fieldElement - The field DOM element
     * @param {Object} fieldConfig - Field configuration from CSV
     */
    applyFieldLogic(fieldElement, fieldConfig) {
        // Check if field should be visible based on complexity and type
        const shouldShowByComplexity = this.complexityCalculator.shouldShowField(
            fieldConfig, 
            this.currentComplexity, 
            this.currentProjectType
        );

        // Check traditional conditional logic (depends_on_field)
        const shouldShowByTraditionalLogic = this.checkTraditionalConditionalLogic(fieldConfig);

        // Field is visible if both conditions are met
        const shouldShow = shouldShowByComplexity && shouldShowByTraditionalLogic;

        if (shouldShow) {
            this.showField(fieldElement);
        } else {
            this.hideField(fieldElement);
        }
    }

    /**
     * Check traditional conditional logic (depends_on_field/depends_on_values)
     * @param {Object} fieldConfig - Field configuration from CSV
     * @returns {boolean} - Whether field should be shown based on traditional logic
     */
    checkTraditionalConditionalLogic(fieldConfig) {
        // If no dependency, show by default
        if (!fieldConfig.depends_on_field) {
            return true;
        }

        const form = document.getElementById('dynamicGeneratedForm');
        if (!form) return false;

        const dependsOnField = form.querySelector(`[name="${fieldConfig.depends_on_field}"]`);
        if (!dependsOnField) return false;

        const currentValue = this.getFieldValue(dependsOnField);
        const requiredValues = fieldConfig.depends_on_values ? fieldConfig.depends_on_values.split('|') : [];

        return requiredValues.includes(currentValue);
    }

    /**
     * Find field element by label name
     * @param {string} fieldLabel - The field label to find
     * @returns {HTMLElement|null} - The field wrapper element
     */
    findFieldElement(fieldLabel) {
        // Try to find by field name (converted to lowercase, no spaces)
        const fieldName = fieldLabel.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        
        // Look for the field wrapper
        const fieldWrapper = document.querySelector(`[data-field-name="${fieldName}"]`);
        if (fieldWrapper) return fieldWrapper;

        // Alternative: look for field by input name
        const input = document.querySelector(`[name="${fieldName}"]`);
        if (input) {
            // Find the closest field wrapper
            return input.closest('.field-wrapper') || input.closest('.form-group') || input.parentElement;
        }

        return null;
    }

    /**
     * Show field with animation
     * @param {HTMLElement} fieldElement - The field element to show
     */
    showField(fieldElement) {
        if (fieldElement.style.display === 'block' || fieldElement.style.display === '') {
            return; // Already visible
        }

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
     * Hide field with animation
     * @param {HTMLElement} fieldElement - The field element to hide
     */
    hideField(fieldElement) {
        if (fieldElement.style.display === 'none') {
            return; // Already hidden
        }

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
     * @param {HTMLElement} field - The field element
     * @returns {string} - The field value
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
     * @param {HTMLElement} fieldElement - The field wrapper element
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
     * Handle general field changes (for backward compatibility)
     * @param {Event} event - The change event
     */
    handleFieldChange(event) {
        const changedField = event.target;
        const fieldName = changedField.name;
        
        // Check if this field affects other fields through traditional conditional logic
        const dependentFields = document.querySelectorAll(`[data-depends-on="${fieldName}"]`);
        
        dependentFields.forEach(field => {
            const fieldConfig = this.findFieldConfig(field);
            if (fieldConfig) {
                this.applyFieldLogic(field, fieldConfig);
            }
        });
    }

    /**
     * Find field configuration by DOM element
     * @param {HTMLElement} fieldElement - The field DOM element
     * @returns {Object|null} - The field configuration
     */
    findFieldConfig(fieldElement) {
        if (!this.formData) return null;

        const fieldName = fieldElement.getAttribute('data-field-name');
        if (!fieldName) return null;

        return this.formData.find(config => {
            const configName = config.form_label.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
            return configName === fieldName;
        });
    }

    /**
     * Get current field counts for debugging
     * @returns {Object} - Field counts by complexity and type
     */
    getFieldCounts() {
        if (!this.formData) return null;

        return {
            current: this.countVisibleFields(),
            expected: this.complexityCalculator.getFieldCounts(this.formData, this.currentProjectType)
        };
    }

    /**
     * Count currently visible fields
     * @returns {number} - Number of visible fields
     */
    countVisibleFields() {
        const form = document.getElementById('dynamicGeneratedForm');
        if (!form) return 0;

        const visibleFields = form.querySelectorAll('.field-wrapper:not([style*="display: none"]), .form-group:not([style*="display: none"])');
        return visibleFields.length;
    }

    /**
     * Log current state for debugging
     */
    logCurrentState() {
        console.log("Adaptive Form State:", {
            complexity: this.currentComplexity,
            projectType: this.currentProjectType,
            fieldCounts: this.getFieldCounts()
        });
    }

    /**
     * Manage section visibility - hide sections with no visible fields
     */
    manageSectionVisibility() {
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            const sectionContent = section.querySelector('.section-content');
            if (!sectionContent) return;
            
            // Count visible fields in this section
            const visibleFields = sectionContent.querySelectorAll('.field-wrapper:not([style*="display: none"])');
            
            if (visibleFields.length === 0) {
                // Hide the entire section if no fields are visible
                section.style.display = 'none';
            } else {
                // Show the section if it has visible fields
                section.style.display = 'block';
            }
        });
    }

    /**
     * Reset all fields to initial state
     */
    reset() {
        this.currentComplexity = "simple";
        this.currentProjectType = "strategic";
        this.applyConditionalLogic();
    }
}

// Make available globally
window.AdaptiveConditionalLogic = AdaptiveConditionalLogic;