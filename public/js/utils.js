// Utility functions
function parseCSV(csvText) {
    // Handle different line endings
    const lines = csvText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    
    // Parse headers - we know they don't contain commas
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    // We know the exact number of columns from headers
    const numColumns = headers.length;
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        // Split by comma but limit to expected number of columns
        // This handles the case where item labels contain commas
        const values = [];
        let currentValue = '';
        let commaCount = 0;
        
        // Parse each character
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
        // Push the last value
        values.push(currentValue.trim());
        
        // Fill in any missing values
        while (values.length < numColumns) {
            values.push('');
        }
        
        // Create object from headers and values
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }
    
    return data;
}

// Debounce function to limit update frequency
function debounce(func, wait) {
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

// Get field value
function getFieldValue(field) {
    if (field.type === 'radio') {
        const checkedRadio = document.querySelector('input[name="' + field.name + '"]:checked');
        return checkedRadio ? checkedRadio.value : '';
    } else if (field.type === 'checkbox') {
        const checkedBoxes = document.querySelectorAll('input[name="' + field.name + '"]:checked');
        return Array.from(checkedBoxes).map(function(cb) { return cb.value; }).join('|');
    } else {
        return field.value;
    }
}

// Clear field values
function clearFieldValue(fieldElement) {
    const inputs = fieldElement.querySelectorAll('input, select, textarea');
    inputs.forEach(function(input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
}

// Check if a field or field group is completed
function isFieldCompleted(fields) {
    const field = fields[0];
    
    if (field.type === 'checkbox') {
        // At least one checkbox must be checked
        return fields.some(f => f.checked);
    } else if (field.type === 'radio') {
        // One radio must be selected
        return fields.some(f => f.checked);
    } else {
        // Text, select, textarea must have value
        return field.value.trim() !== '';
    }
}

// Check server health
async function checkServerHealth() {
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