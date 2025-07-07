/**
 * Complexity Calculator Module
 * Determines project complexity based on budget range and project duration
 * Used for two-dimensional adaptive form logic
 */
class ComplexityCalculator {
    constructor() {
        // Budget range to complexity mapping
        this.budgetComplexityMap = {
            "Under $5K": "simple",
            "$5K-15K": "simple",
            "$15K-50K": "standard",
            "$50K-100K": "standard", 
            "$100K-250K": "complex",
            "$250K+": "complex"
        };

        // Duration to complexity mapping
        this.durationComplexityMap = {
            "1-2 weeks": "simple",
            "3-4 weeks": "simple",
            "1-3 months": "standard",
            "3-6 months": "standard",
            "6-12 months": "complex",
            "12+ months": "complex"
        };

        // Complexity priority order (higher index = higher complexity)
        this.complexityOrder = ["simple", "standard", "complex"];
    }

    /**
     * Calculate project complexity based on budget and duration
     * @param {string} budgetRange - Selected budget range
     * @param {string} projectDuration - Selected project duration
     * @returns {string} - "simple", "standard", or "complex"
     */
    calculateComplexity(budgetRange, projectDuration) {
        // Get complexity from budget
        const budgetComplexity = this.budgetComplexityMap[budgetRange] || "simple";
        
        // Get complexity from duration
        const durationComplexity = this.durationComplexityMap[projectDuration] || "simple";

        // Return the higher of the two complexities
        const budgetIndex = this.complexityOrder.indexOf(budgetComplexity);
        const durationIndex = this.complexityOrder.indexOf(durationComplexity);
        
        const finalComplexityIndex = Math.max(budgetIndex, durationIndex);
        return this.complexityOrder[finalComplexityIndex];
    }

    /**
     * Get complexity from form values
     * @param {HTMLFormElement} form - The form element
     * @returns {string} - Current project complexity
     */
    getComplexityFromForm(form) {
        if (!form) return "simple";

        const budgetRange = this.getFormValue(form, "budgetrange");
        const projectDuration = this.getFormValue(form, "projectduration");

        return this.calculateComplexity(budgetRange, projectDuration);
    }

    /**
     * Get project type from form values
     * @param {HTMLFormElement} form - The form element
     * @returns {string} - "strategic", "technical", or "operational"
     */
    getProjectTypeFromForm(form) {
        if (!form) return "strategic";

        const problemCategory = this.getFormValue(form, "problemcategory");
        return problemCategory ? problemCategory.toLowerCase() : "strategic";
    }

    /**
     * Get form field value by name (handles different input types)
     * @param {HTMLFormElement} form - The form element
     * @param {string} fieldName - The field name to get value from
     * @returns {string} - The field value
     */
    getFormValue(form, fieldName) {
        // Try to find field by name (case-insensitive)
        const field = form.querySelector(`[name="${fieldName}"], [name="${fieldName.toLowerCase()}"]`);
        
        if (!field) return "";

        // Handle different input types
        if (field.type === "radio") {
            const checkedRadio = form.querySelector(`[name="${fieldName}"]:checked, [name="${fieldName.toLowerCase()}"]:checked`);
            return checkedRadio ? checkedRadio.value : "";
        } else if (field.type === "checkbox") {
            const checkedBoxes = form.querySelectorAll(`[name="${fieldName}"]:checked, [name="${fieldName.toLowerCase()}"]:checked`);
            return Array.from(checkedBoxes).map(cb => cb.value).join("|");
        } else if (field.tagName === "SELECT") {
            return field.value;
        } else {
            return field.value;
        }
    }

    /**
     * Check if a field should be visible based on complexity and type
     * @param {Object} fieldConfig - Field configuration from CSV
     * @param {string} complexity - Current complexity level
     * @param {string} projectType - Current project type
     * @returns {boolean} - Whether field should be visible
     */
    shouldShowField(fieldConfig, complexity, projectType) {
        // Universal fields are always shown
        if (fieldConfig.is_universal === "TRUE") {
            return true;
        }

        // Check complexity-based visibility
        const complexityVisible = fieldConfig[`complexity_${complexity}`] === "TRUE";
        
        // Check type-based visibility
        const typeVisible = fieldConfig[`type_${projectType}`] === "TRUE";

        // Field is visible if both complexity and type conditions are met
        return complexityVisible && typeVisible;
    }

    /**
     * Get field counts for different complexity levels (for debugging/testing)
     * @param {Array} formData - Array of field configurations
     * @param {string} projectType - Project type to check
     * @returns {Object} - Field counts by complexity level
     */
    getFieldCounts(formData, projectType) {
        const counts = {
            simple: 0,
            standard: 0,
            complex: 0
        };

        formData.forEach(fieldConfig => {
            ["simple", "standard", "complex"].forEach(complexity => {
                if (this.shouldShowField(fieldConfig, complexity, projectType)) {
                    counts[complexity]++;
                }
            });
        });

        return counts;
    }

    /**
     * Log complexity calculation details (for debugging)
     * @param {string} budgetRange - Selected budget range
     * @param {string} projectDuration - Selected project duration
     * @param {string} projectType - Selected project type
     */
    logComplexityDetails(budgetRange, projectDuration, projectType) {
        const budgetComplexity = this.budgetComplexityMap[budgetRange] || "simple";
        const durationComplexity = this.durationComplexityMap[projectDuration] || "simple";
        const finalComplexity = this.calculateComplexity(budgetRange, projectDuration);

        console.log("Complexity Calculation:", {
            budgetRange,
            projectDuration,
            projectType,
            budgetComplexity,
            durationComplexity,
            finalComplexity
        });
    }
}

// Make available globally
window.ComplexityCalculator = ComplexityCalculator;