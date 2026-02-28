# Documentation System - Setup Guide

## Overview
A comprehensive documentation and help center has been added to the School Management System (Zosto) at the `/help` route.

## Route
- **URL**: `/help`
- **Access**: Public (no authentication required)
- **Component**: `Documentation.jsx`

## Features
✅ **Overview** - Introduction and system overview  
✅ **Student Guide** - Complete student panel guide  
✅ **Teacher Guide** - Teacher features and how-to  
✅ **Admin Guide** - School admin operations  
✅ **Super Admin Guide** - Multi-school management  

## File Structure
```
frontend/src/
├── components/
│   └── documentation/
│       ├── Documentation.jsx          # Main component
│       ├── Documentation.css          # Main styles
│       ├── Sidebar.jsx               # Navigation sidebar
│       ├── Sidebar.css               # Sidebar styles
│       └── pages/
│           ├── Overview.jsx          # System overview
│           ├── StudentGuide.jsx      # Student guide
│           ├── TeacherGuide.jsx      # Teacher guide
│           ├── AdminGuide.jsx        # Admin guide
│           └── SuperAdminGuide.jsx   # Super admin guide
└── assets/
    └── documentation/               # Add screenshots here
```

## How to Add Screenshots

### Step 1: Create Directories
Screenshots should be organized by section:
```
src/assets/documentation/
├── student/           # Student guide screenshots
├── teacher/          # Teacher guide screenshots
├── admin/            # Admin guide screenshots
├── superadmin/       # Super admin guide screenshots
└── overview/         # Overview screenshots
```

### Step 2: Place Screenshot Files
Add your screenshots (.png, .jpg, .jpeg format) to the appropriate folders.

### Step 3: Update Guide Components
In each guide file, update the screenshot placeholder sections:

**Example:**
```jsx
// Before:
<div className="screenshot-placeholder">
  📷 Login Page Screenshot
</div>

// After:
<img 
  src="/src/assets/documentation/student/login-screenshot.png" 
  alt="Student Login Page"
  className="screenshot-image"
/>
```

### Step 4: Add Screenshot CSS
Add this to the respective CSS files to style screenshots:

```css
.screenshot-image {
  max-width: 100%;
  height: auto;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  margin: 15px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

## Screenshot Recommendations

### Naming Convention
Use clear, descriptive names:
- `student-login.png`
- `student-dashboard-overview.png`
- `student-view-grades.png`
- `teacher-mark-attendance.png`
- `admin-add-student.png`
- `superadmin-school-management.png`

### Image Quality
- Minimum width: 800px
- PNG format preferred (smaller file size)
- Clear, readable content
- Include helpful annotations if needed

### Coverage Areas

#### Student Section
- Login page
- Dashboard overview
- View grades/academics
- Check attendance
- Download study materials
- Profile update
- Fee information

#### Teacher Section
- Login page
- Dashboard overview
- Mark attendance process
- Upload grades process
- Create assignment steps
- Upload study materials
- Send notifications

#### Admin Section
- Login page
- Dashboard overview
- Add student process
- Add staff process
- Define fee structure
- Create exam
- Generate reports
- Fee management

#### Super Admin Section
- Login page
- Dashboard overview
- Register new school
- Create school admin
- View analytics
- Manage subscriptions
- View revenue reports

## Styling Classes Available

All documentation pages use these CSS classes:

```css
.screenshot-placeholder    /* Placeholder for screenshots */
.feature-section          /* Feature description boxes */
.task-item               /* Step-by-step task boxes */
.role-card               /* Role description cards */
.troubleshooting         /* Troubleshooting section */
.quick-tips             /* Quick tips section */
.guide-step             /* Individual guide steps */
```

## Navigation

Users can navigate using:
- Left sidebar with 5 main sections
- Smooth scrolling within pages
- Mobile-responsive design
- Active section highlighting

## Customization

### Add New Guide Section
1. Create new file: `pages/NewGuide.jsx`
2. Import in `Documentation.jsx`
3. Add case to switch statement
4. Add sidebar item to `Sidebar.jsx`

### Modify Colors
Edit the CSS files to change:
- Primary: `#667eea`
- Secondary: `#764ba2`
- Text: `#555` or `#333`

## Responsive Design
The documentation system is fully responsive:
- Desktop: Sidebar left, content right
- Tablet: Sidebar top, content below
- Mobile: Full width stacking

## Testing
1. Navigate to `/help` route
2. Test sidebar navigation
3. Test mobile responsiveness
4. Verify all links work
5. Check screenshot loading once added

## Next Steps
1. Organize your screenshots in the recommended folder structure
2. Update the guide components with actual screenshots
3. Add more detailed step-by-step instructions with images
4. Consider adding video tutorials for complex processes

---

**Note**: All documentation is currently a template. Replace placeholder text and add actual screenshots to provide comprehensive guidance to users.
