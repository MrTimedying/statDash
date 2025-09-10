# Graphics Foundation for StatDash

This document outlines the graphical design principles derived from analyzing the Microsoft Data Formulator application. These principles will guide the styling and layout of StatDash to achieve a similar professional, user-friendly, and visually consistent interface.

## Overview

Data Formulator is a web-based AI-powered data visualization tool that combines drag-and-drop interactions with natural language inputs. Its design emphasizes clarity, efficiency, and accessibility while maintaining a modern, clean aesthetic suitable for data analysis workflows.

## Core Design Principles

### 1. Layout Architecture

#### Three-Panel Layout
- **Left Sidebar**: Data management, field selection, and control panels
  - Width: ~300px (fixed)
  - Contains: Dataset selector, field list, encoding shelf
- **Main Visualization Area**: Central chart display
  - Flexible width, responsive to screen size
  - High contrast background for chart clarity
- **Right Panel** (optional): Properties, data threads, or additional controls
  - Width: ~250px (collapsible)
  - Contains: Chart properties, AI suggestions, history

#### Responsive Design
- Minimum width: 1024px for full functionality
- Mobile adaptation: Stacked layout with collapsible panels
- Grid-based spacing: 8px base unit

### 2. Color Scheme

#### Primary Palette
- **Background**: #ffffff (pure white) or #f8f9fa (light gray)
- **Surface**: #ffffff with subtle shadows
- **Text Primary**: #212529 (dark gray)
- **Text Secondary**: #6c757d (medium gray)
- **Accent/Interactive**: #007bff (blue) for buttons, links, highlights
- **Success**: #28a745 (green)
- **Warning**: #ffc107 (yellow)
- **Error**: #dc3545 (red)

#### Chart Colors
- Categorical palettes: 10-12 distinct colors
- Sequential scales for continuous data
- Diverging scales for bipolar data
- High contrast ratios for accessibility

### 3. Typography

#### Font Family
- Primary: Inter (or system sans-serif fallback)
- Monospace: For code snippets and data values

#### Type Scale
- **H1**: 32px / 1.2 line-height (page titles)
- **H2**: 24px / 1.4 line-height (section headers)
- **H3**: 18px / 1.4 line-height (panel headers)
- **Body Large**: 16px / 1.6 line-height (primary content)
- **Body**: 14px / 1.6 line-height (secondary content)
- **Caption**: 12px / 1.5 line-height (labels, metadata)
- **Small**: 11px / 1.4 line-height (fine print)

#### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### 4. Spacing and Proportions

#### Spacing Scale
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

#### Component Spacing
- **Padding**: 16px internal padding for panels
- **Margins**: 16px between major sections
- **Gaps**: 8px between related elements
- **Borders**: 1px solid #dee2e6

#### Proportions
- **Sidebar ratio**: 25% of screen width
- **Main area**: 60-70% of screen width
- **Right panel**: 15-20% of screen width
- **Header height**: 64px
- **Button height**: 36px (standard), 44px (touch targets)

### 5. Interactive Elements

#### Buttons
- **Primary**: Blue background (#007bff), white text
- **Secondary**: White background, blue border and text
- **Ghost**: Transparent background, blue text
- **States**: Hover (+10% opacity), active, disabled (50% opacity)
- **Border radius**: 4px
- **Padding**: 8px horizontal, 6px vertical

#### Form Controls
- **Input fields**: Height 36px, border radius 4px
- **Dropdowns**: Same as inputs with chevron icon
- **Checkboxes/Radio**: 16px size, blue accent
- **Focus states**: Blue outline (2px)

#### Drag and Drop
- **Drag handles**: Gray bars or dots
- **Drop zones**: Highlighted with blue border and background
- **Feedback**: Visual cues during drag operations

### 6. Data Visualization

#### Chart Aesthetics
- **Background**: White or light gray
- **Grid lines**: Light gray (#e9ecef), subtle
- **Axes**: Clean labels, appropriate tick marks
- **Legends**: Positioned outside chart area, clear icons
- **Tooltips**: Dark background, white text, rounded corners

#### Chart Types
- **Bar charts**: Consistent bar width, proper spacing
- **Line charts**: Smooth curves, clear markers
- **Scatter plots**: Appropriate point sizes, color encoding
- **Histograms**: Bins with clear boundaries

### 7. Accessibility

#### Color Contrast
- Text on background: 4.5:1 minimum ratio
- Interactive elements: 3:1 minimum ratio
- Charts: Sufficient contrast for all data points

#### Focus Management
- Visible focus indicators
- Logical tab order
- Keyboard navigation support

#### Screen Reader Support
- Proper ARIA labels
- Semantic HTML structure
- Alt text for images

### 8. Animation and Transitions

#### Micro-interactions
- **Hover**: 200ms ease-in-out
- **Click feedback**: 100ms scale or opacity change
- **Loading states**: Skeleton screens or spinners
- **Transitions**: Smooth panel expansions/collapses

#### Data Updates
- **Chart transitions**: 300ms for data changes
- **Smooth animations**: For sorting, filtering operations

## Implementation Guidelines

### CSS Architecture
- Use CSS custom properties for color tokens
- Implement design system with utility classes
- Maintain consistent spacing with CSS grid/flexbox
- Use CSS modules or styled-components for component styling

### Component Library
- Build reusable components following these principles
- Maintain design consistency across all UI elements
- Document component usage and variations

### Responsive Breakpoints
- **Mobile**: < 768px (stacked layout)
- **Tablet**: 768px - 1024px (compact sidebar)
- **Desktop**: > 1024px (full three-panel layout)

## References

- Microsoft Data Formulator GitHub Repository
- Web Content Accessibility Guidelines (WCAG 2.1)
- Material Design principles for consistency
- Data visualization best practices from Edward Tufte

This foundation provides a solid base for creating a professional, accessible, and user-friendly interface for StatDash that aligns with modern data visualization tool standards.