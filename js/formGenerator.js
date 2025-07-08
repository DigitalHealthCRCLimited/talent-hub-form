/**
 * Form Generator Module
 * Handles dynamic form creation from CSV configuration
 */
class FormGenerator {
    constructor() {
        this.formData = [];
        this.onFormReady = null;
    }

    /**
     * Parse CSV text into array of objects
     */
    parseCSV(csvText) {
        const lines = csvText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        const numColumns = headers.length;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = [];
            let currentValue = '';
            let commaCount = 0;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                
                if (char === ',' && commaCount < numColumns - 1) {
                    values.push(currentValue.trim());
                    currentValue = '';
                    commaCount++;
                } else {
                    currentValue += char;
                }
            }
            values.push(currentValue.trim());
            
            while (values.length < numColumns) {
                values.push('');
            }
            
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
        
        return data;
    }

    /**
     * Load form configuration from CSV file
     */
    async loadFormConfig() {
        try {
            const response = await fetch('form.csv');
            if (!response.ok) {
                throw new Error('Failed to load form configuration');
            }
            const csvText = await response.text();
            this.formData = this.parseCSV(csvText);
            return this.formData;
        } catch (error) {
            console.error('Error loading form:', error);
            throw error;
        }
    }

    /**
     * Generate complete form HTML
     */
    generateForm(formData = this.formData) {
        const sections = this.groupBySection(formData);
        
        let formHTML = this.generateSectionControls();
        formHTML += '<form id="dynamicGeneratedForm">';
        
        let sectionIndex = 0;
        Object.keys(sections).forEach(sectionTitle => {
            formHTML += this.generateSection(sectionTitle, sections[sectionTitle], sectionIndex);
            sectionIndex++;
        });

        formHTML += this.generateSubmitSection();
        formHTML += '</form>';
        
        return formHTML;
    }

    /**
     * Group form data by sections
     */
    groupBySection(formData) {
        const sections = {};
        formData.forEach(item => {
            if (!sections[item.section_title]) {
                sections[item.section_title] = [];
            }
            sections[item.section_title].push(item);
        });
        return sections;
    }

    /**
     * Generate section control buttons
     */
    generateSectionControls() {
        return `
            <div class="section-controls">
                <button type="button" class="expand-all-btn" onclick="window.uiManager.expandAllSections()">Expand All</button>
                <button type="button" class="collapse-all-btn" onclick="window.uiManager.collapseAllSections()">Collapse All</button>
            </div>
        `;
    }

    /**
     * Generate individual section HTML
     */
    generateSection(sectionTitle, sectionItems, sectionIndex) {
        const isAISection = sectionTitle.toLowerCase().includes('ai-assisted');
        const sectionClass = isAISection ? 'section ai-section collapsible collapsed' : 'section collapsible collapsed';
        const sectionId = 'section-' + sectionIndex;
        
        let html = `<div class="${sectionClass}" data-section-id="${sectionId}">`;
        html += `<div class="section-header" onclick="window.uiManager.toggleSection('${sectionId}')">`;
        html += `<h2 class="section-title">${sectionTitle}</h2>`;
        html += '<span class="section-toggle"><svg class="collapse-icon" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M5 7l5 5 5-5z"/></svg></span>';
        html += '</div>';
        
        html += `<div class="section-content" id="${sectionId}">`;
        sectionItems.forEach(item => {
            html += this.generateFormGroup(item);
        });
        
        if (isAISection) {
            html += '<div class="ai-note"><strong>AI Processing Note:</strong> This section will be enhanced by our AI algorithm to suggest additional relevant skills based on your problem description.</div>';
        }
        html += '</div></div>';
        
        return html;
    }

    /**
     * Generate individual form field
     */
    generateFormGroup(item) {
        const fieldName = item.form_label.toLowerCase().replace(/[^a-z0-9]/g, '');
        const requiredClass = item.required === 'TRUE' ? 'required' : '';
        const requiredAttr = item.required === 'TRUE' ? 'required' : '';
        
        const showByDefault = item.show_by_default !== 'FALSE';
        const dependsOnField = item.depends_on_field || '';
        const dependsOnValues = item.depends_on_values || '';
        
        // Add complexity and type attributes for adaptive logic
        const complexityAttrs = `data-complexity-simple="${item.complexity_simple || 'FALSE'}" 
                                data-complexity-standard="${item.complexity_standard || 'FALSE'}" 
                                data-complexity-complex="${item.complexity_complex || 'FALSE'}"`;
        
        const typeAttrs = `data-type-strategic="${item.type_strategic || 'FALSE'}" 
                          data-type-technical="${item.type_technical || 'FALSE'}" 
                          data-type-operational="${item.type_operational || 'FALSE'}"`;
        
        const isUniversal = item.is_universal === 'TRUE';
        const universalAttr = `data-is-universal="${isUniversal}"`;
        
        // Traditional conditional attributes
        const conditionalAttrs = dependsOnField ? 
            `data-depends-on="${dependsOnField}" data-depends-values="${dependsOnValues}"` : '';
        
        // Determine initial visibility
        let initialVisibility = '';
        if (!showByDefault || (!isUniversal && !dependsOnField)) {
            initialVisibility = ' style="display: none;"';
        }
        
        let html = `<div class="field-wrapper" data-field-name="${fieldName}" ${conditionalAttrs} ${complexityAttrs} ${typeAttrs} ${universalAttr}${initialVisibility}>`;
        html += `<div class="form-group">`;
        html += `<label class="form-label ${requiredClass}">${item.form_label}</label>`;
        
        if (item.form_instructions) {
            html += `<div class="form-instructions">${item.form_instructions}</div>`;
        }
        
        html += this.generateFormField(item, fieldName, requiredAttr);
        html += '</div>';
        html += '</div>';
        
        return html;
    }

    /**
     * Generate form field based on type
     */
    generateFormField(item, fieldName, requiredAttr) {
        switch (item.form_class) {
            case 'text':
                return `<input type="text" class="form-control" name="${fieldName}" ${requiredAttr} placeholder="${item.placeholder}">`;
                
            case 'textarea':
                return `<textarea class="form-control textarea" name="${fieldName}" ${requiredAttr} placeholder="${item.placeholder}"></textarea>`;
                
            case 'date':
                return `<input type="date" class="form-control" name="${fieldName}" ${requiredAttr}>`;
                
            case 'select':
                return this.generateSelectField(item, fieldName, requiredAttr);
                
            case 'checkbox-group':
                return this.generateCheckboxGroup(item, fieldName);
                
            case 'radio-group':
                return this.generateRadioGroup(item, fieldName, requiredAttr);
                
            default:
                return '';
        }
    }

    /**
     * Generate select field
     */
    generateSelectField(item, fieldName, requiredAttr) {
        let html = `<select class="form-control" name="${fieldName}" ${requiredAttr}>`;
        html += '<option value="">Select option...</option>';
        
        for (let i = 1; i <= 6; i++) {
            const optionLabel = item['item_label_' + i];
            if (optionLabel) {
                html += `<option value="${optionLabel}">${optionLabel}</option>`;
            }
        }
        html += '</select>';
        return html;
    }

    /**
     * Generate checkbox group
     */
    generateCheckboxGroup(item, fieldName) {
        let html = '<div class="checkbox-group">';
        
        for (let i = 1; i <= 6; i++) {
            const optionLabel = item['item_label_' + i];
            if (optionLabel) {
                const optionId = fieldName + '_' + i;
                html += '<div class="checkbox-item">';
                html += `<input type="checkbox" id="${optionId}" name="${fieldName}" value="${optionLabel}">`;
                html += `<label for="${optionId}">${optionLabel}</label>`;
                html += '</div>';
            }
        }
        html += '</div>';
        return html;
    }

    /**
     * Generate radio group
     */
    generateRadioGroup(item, fieldName, requiredAttr) {
        let html = '<div class="radio-group">';
        
        for (let i = 1; i <= 6; i++) {
            const optionLabel = item['item_label_' + i];
            if (optionLabel) {
                const optionId = fieldName + '_' + i;
                html += '<div class="radio-item">';
                html += `<input type="radio" id="${optionId}" name="${fieldName}" value="${optionLabel}" ${requiredAttr}>`;
                html += `<label for="${optionId}">${optionLabel}</label>`;
                html += '</div>';
            }
        }
        html += '</div>';
        return html;
    }

    /**
     * Generate submit section
     */
    generateSubmitSection() {
        return `
            <div class="submit-section">
                <button type="submit" class="submit-btn">Submit Problem Statement</button>
            </div>
            <p class="ai-processing-note">
                Our AI will process your submission and match you with qualified talent
            </p>
        `;
    }
}

// Export for use in other modules
window.FormGenerator = FormGenerator;