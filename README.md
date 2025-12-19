# GraderX - LNMIIT Grading System

A modern web application for LNMIIT students to track their academic progress, calculate SGPA/CGPA, and manage their grades efficiently.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd graderX-main
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development environment**

   ```bash
   ./start-dev.sh
   ```

   This script will:

   - Check and start Docker/Supabase
   - Set environment variables
   - Start the Next.js development server

4. **Access the application**
   - Main App: `http://localhost:3000`
   - Supabase Studio: `http://127.0.0.1:54323`

## 👨‍💼 Admin Access

### Method 1: Admin Passcode (Recommended)

1. Sign up with any email at `/sign-up`
2. Go to `/admin-access`
3. Enter admin passcode: **`LNMIIT_ADMIN_2024`**
4. Your account gets admin privileges

### Method 2: Dashboard Access

1. Sign in with any account
2. Go to `/dashboard`
3. Enter passcode: **`12345`**
4. Access admin features

### Admin Features

- Subject management
- Initialize LNMIIT curriculum
- Student grade oversight
- System administration

## 🏗️ Features

### For Students

- **Grade Tracking**: Input and monitor grades across semesters
- **SGPA/CGPA Calculation**: Automatic calculation based on LNMIIT's 10-point scale
- **Subject Management**: View subjects by semester and branch
- **Academic Progress**: Track performance over time
- **Responsive Design**: Works on desktop and mobile devices

### For Administrators

- **Subject Administration**: Add, edit, and delete subjects
- **Curriculum Management**: Initialize default LNMIIT subjects
- **Student Oversight**: Monitor student progress
- **Data Management**: Bulk operations and data import/export

## 🎓 LNMIIT Integration

- **Authentic Curriculum**: Real LNMIIT subjects across all branches
- **Branch Support**: CSE, ECE, ME, CE, CCE
- **Semester System**: 8-semester structure
- **Credit System**: Proper credit allocation
- **Grade Scale**: A+ (10.0) to F (0.0) grading system

## 💻 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL with RLS
- **Deployment**: Ready for Vercel/Netlify

## 🛠️ Development

### Environment Variables

The application uses Supabase local development:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Schema

- `users`: Student/admin profiles
- `subjects`: Course catalog
- `user_grades`: Individual grades
- `cgpa_calculations`: SGPA/CGPA tracking

### Key Commands

```bash
# Start development (recommended)
./start-dev.sh

# Manual start
npm run dev

# Database reset
supabase db reset

# TypeScript check
npx tsc --noEmit
```

## 🐛 Troubleshooting

### Common Issues

1. **"Database error saving new user"** ✅ **FIXED**
2. **"An unexpected error occurred"** ✅ **FIXED**
3. **Admin access confusion** ✅ **CLARIFIED**

### Quick Fixes

```bash
# Complete reset
pkill -f "next dev"
supabase stop
supabase start
supabase db reset
./start-dev.sh
```

See `TROUBLESHOOTING.md` for detailed solutions.

## 📚 Documentation

- `ADMIN_GUIDE.md` - Complete admin features guide
- `TROUBLESHOOTING.md` - Common issues and solutions
- `SUBJECT_MANAGEMENT_IMPROVEMENTS.md` - Recent enhancements

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built for LNMIIT students to make academic tracking easier and more efficient.

---

**Need Help?** Check the troubleshooting guide or create an issue in the repository.
