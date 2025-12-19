# 🔐 GraderX Admin Portal Guide

## 📋 **Table of Contents**

1. [Getting Admin Access](#getting-admin-access)
2. [Admin Features Overview](#admin-features-overview)
3. [Subject Management](#subject-management)
4. [Database Setup](#database-setup)
5. [User Management](#user-management)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 **Getting Admin Access**

### **Method 1: Admin Passcode (Recommended)**

1. **Sign up for a regular account** at `/sign-up`
2. **Navigate to Admin Access** at `/admin-access`
3. **Enter the admin passcode**: `LNMIIT_ADMIN_2024`
4. **Get instant admin privileges!** ✅

### **Method 2: Manual Database Update**

1. Sign up as a regular user
2. Go to your Supabase dashboard
3. Navigate to `Table Editor > users`
4. Find your user record
5. Change `role` column from `student` to `admin`

### **Method 3: SQL Command**

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 🎛️ **Admin Features Overview**

Once you have admin access, you get access to:

### **📚 Subject Management Portal** (`/dashboard/admin/subjects`)

- ✅ Add new subjects with branch categorization
- ✅ Initialize default LNMIIT subjects for all branches
- ✅ View all subjects organized by semester and branch
- ✅ Subject statistics and distribution

### **📊 Enhanced Dashboard Statistics**

- 👥 Total users count
- 📖 Total subjects count
- 🔄 Recent activity monitoring
- 📈 System overview and health metrics

### **🔍 Admin Navigation Features**

- Purple-colored admin badges and sections
- Enhanced menu items and management tools
- Quick access to admin-only functions

---

## 📚 **Subject Management**

### **Adding New Subjects**

**Required Fields:**

- **Subject Name**: e.g., "Machine Learning"
- **Subject Code**: e.g., "CSE401"
- **Credits**: 1-6 credits
- **Semester**: 1-8
- **Branch**: CSE, ECE, ME, CE, CCE, Common, or Other

**Branch Categories:**

- **Common**: Subjects for all branches (Math, Physics, etc.)
- **CSE**: Computer Science & Engineering
- **ECE**: Electronics & Communication Engineering
- **ME**: Mechanical Engineering
- **CE**: Civil Engineering
- **CCE**: Computer & Communication Engineering
- **Other**: Specialized or elective subjects

### **Initialize Default Subjects**

Click the **"Initialize Default Subjects"** button to automatically add:

#### **Semester 1-2 (Common Subjects)**

- Engineering Mathematics I & II
- Physics, Chemistry
- Programming Fundamentals
- English Communication
- Environmental Science

#### **Semester 3+ (Branch-Specific)**

**CSE Subjects:**

- Data Structures, Computer Organization
- Database Management Systems
- Operating Systems, Computer Networks
- Machine Learning, Artificial Intelligence
- Web Technologies, Cloud Computing

**ECE Subjects:**

- Signals and Systems, Electronic Devices
- Digital Signal Processing
- Communication Systems, Control Systems
- VLSI Design, Embedded Systems

**ME Subjects:**

- Thermodynamics, Strength of Materials
- Fluid Mechanics, Heat Transfer
- Machine Design, Production Technology

**CE Subjects:**

- Structural Analysis, Concrete Technology
- Soil Mechanics, Transportation Engineering

### **Subject Display Features**

**Color-Coded Branch Tags:**

- 🔘 **Common**: Gray
- 🔵 **CSE**: Blue
- 🟣 **ECE**: Purple
- 🟢 **ME**: Green
- 🟠 **CE**: Orange
- 🩷 **CCE**: Pink

**Table Columns:**

- Subject Name
- Subject Code
- Branch (with color coding)
- Credits (with badge)
- Actions (Edit/Delete - Coming Soon)

---

## 🗄️ **Database Setup**

### **Required Tables Structure**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  full_name VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  branch VARCHAR,
  role VARCHAR DEFAULT 'student',
  created_at TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  credits INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  branch VARCHAR DEFAULT 'Common',
  created_at TIMESTAMP
);

-- User grades table
CREATE TABLE user_grades (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  subject_id UUID REFERENCES subjects(id),
  grade VARCHAR,
  grade_points DECIMAL,
  semester INTEGER,
  academic_year VARCHAR,
  created_at TIMESTAMP
);

-- CGPA calculations table
CREATE TABLE cgpa_calculations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  semester INTEGER,
  sgpa DECIMAL,
  cgpa DECIMAL,
  total_credits INTEGER,
  total_grade_points DECIMAL,
  calculated_at TIMESTAMP
);
```

### **Environment Variables**

Add to your `.env.local`:

```bash
# Admin Configuration
ADMIN_PASSCODE=LNMIIT_ADMIN_2024

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 👥 **User Management**

### **User Roles**

- **student**: Default role, can use calculator and save grades
- **admin**: Full access to admin portal and management features

### **User Registration Flow**

1. User signs up with branch selection
2. Account created with `student` role
3. Admin can promote users to admin via database or passcode system

### **Admin Responsibilities**

- ✅ Manage subject database
- ✅ Initialize curriculum data
- ✅ Monitor system usage
- ✅ Ensure data accuracy

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **"Access Denied" Error**

- **Cause**: User doesn't have admin role
- **Solution**:
  1. Check user role in database
  2. Use admin passcode at `/admin-access`
  3. Manually update role in Supabase

#### **Subjects Not Showing in Calculator**

- **Cause**: Branch mismatch or missing subjects
- **Solution**:
  1. Check subject branch matches selected branch
  2. Initialize default subjects
  3. Add missing subjects manually

#### **Admin Passcode Not Working**

- **Cause**: Environment variable not set
- **Solution**:
  1. Check `.env.local` file
  2. Restart development server
  3. Verify passcode matches exactly

#### **Database Connection Issues**

- **Cause**: Supabase configuration problem
- **Solution**:
  1. Verify Supabase URL and keys
  2. Check table permissions
  3. Ensure RLS policies allow admin access

### **Admin Portal Access URLs**

- **Main Admin**: `/dashboard/admin/subjects`
- **Admin Access**: `/admin-access`
- **Dashboard**: `/dashboard` (with admin features)

### **Support**

For technical issues:

- Check browser console for errors
- Verify network connectivity
- Review Supabase logs
- Contact system administrator

---

## 🎯 **Best Practices**

1. **Regular Backups**: Export subject data regularly
2. **Data Validation**: Verify new subjects before adding
3. **Branch Consistency**: Use standard branch codes
4. **User Management**: Monitor admin access carefully
5. **Testing**: Test new subjects in calculator before deployment

---

## 📈 **Future Enhancements**

**Coming Soon:**

- ✏️ Edit/Delete subjects functionality
- 📊 Advanced analytics dashboard
- 👥 Bulk user management
- 📋 Grade report generation
- 🔄 Data import/export tools

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Compatibility**: Next.js 15.3.3, Supabase
