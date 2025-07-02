# Talent Hub - Problem Statement Form

An adaptive form for collecting problem statements from founders, innovation leads, and senior problem owners. Features dynamic field display, auto-save functionality, and real submission handling.

## Features

- **Dynamic Form Generation**: Form fields loaded from CSV configuration
- **Conditional Logic**: Fields show/hide based on user selections
- **Auto-Save**: Automatic saving to localStorage to prevent data loss
- **Collapsible Sections**: Organized sections that can be expanded/collapsed
- **Form Submission**: Express.js backend for saving submissions

## Project Structure

```
/public
  ├── index.html          # Main form interface
  ├── styles.css          # Dark theme styling
  ├── form.csv           # Form configuration data
  ├── server.js          # Express backend for submissions
  ├── package.json       # Node dependencies
  └── view-submissions.html  # View locally saved submissions
```

## Installation

1. Install dependencies:
```bash
cd public
npm install
```

2. Start the server:
```bash
npm start
```

3. Open in browser:
```
http://localhost:3000
```

## Form Configuration

The form structure is defined in `form.csv`. Each row represents a form field with:
- Section title and grouping
- Field type (text, textarea, select, checkbox-group, radio-group)
- Validation rules
- Conditional display logic
- Placeholder text and instructions

### Conditional Fields

Some fields only appear based on other selections:
- **Location**: Shows when Work Mode is "Hybrid" or "In-person required"
- **Communication Frequency**: Shows for hybrid/in-person work modes

## Data Storage

### Auto-Save
- Form data automatically saved to localStorage as users type
- Restored on page reload with user confirmation
- Cleared after successful submission

### Submissions
- Server saves to `/submissions` directory
- Each submission creates:
  - Individual JSON file with unique ID
  - Entry in master CSV file
- Fallback to localStorage if server unavailable

## Customization

### Modify Form Fields
Edit `form.csv` to:
- Add/remove fields
- Change field types
- Update validation rules
- Modify conditional logic

### Styling
Edit `styles.css` to customize:
- Colors and gradients
- Spacing and layout
- Animations
- Mobile breakpoints

