# AgriTrust - Modern Agricultural Management Platform

A fully responsive and modern web application built with Next.js, React, Tailwind CSS, and Firebase for managing agricultural operations with blockchain technology integration.

## 🌟 Features

### Core Functionality
- **Dashboard**: Real-time analytics with statistic cards and interactive charts
- **Farmer Logs**: Comprehensive farmer activity tracking with CRUD operations
- **Blockchain Ledger**: Immutable transaction records with visualization
- **Price Forecast**: AI-powered price predictions with historical trends
- **Admin Panel**: Complete user management and system administration

### Technical Features
- ✅ **Fully Responsive**: Mobile-first design with Tailwind CSS
- ✅ **Real-time Updates**: Firebase Firestore integration
- ✅ **Authentication**: Secure Firebase Authentication
- ✅ **Interactive Charts**: Recharts with Framer Motion animations
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Modern UI**: Radix UI components with custom styling
- ✅ **Data Export**: CSV and PDF export functionality
- ✅ **Bulk Operations**: CSV import/export for data management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project (for backend services)
- Google AI API key (for price predictions)

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd agritrust

# Install dependencies
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google AI API Key (for price predictions)
GOOGLE_GENAI_API_KEY=your-google-ai-api-key
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication and Firestore Database

#### Authentication Setup
1. In Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" and "Google" providers
3. Add your domain to authorized domains

#### Firestore Database Setup
1. Create Firestore Database in "production" mode
2. Set up the following collections:
   - `users` - User profiles and roles
   - `farmer-logs` - Farmer activity logs
   - `blockchain-transactions` - Transaction records
   - `price-data` - Historical and predicted prices

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin-only collections
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Farmer logs - farmers can create/read, admins can do everything
    match /farmer-logs/{logId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'farmer'];
    }
    
    // Blockchain transactions - read only for most users
    match /blockchain-transactions/{transactionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Run the Application
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin panel pages
│   ├── blockchain-ledger/ # Blockchain ledger pages
│   ├── farmer-logs/       # Farmer logs pages
│   ├── price-forecast/    # Price forecast pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── blockchain/       # Blockchain visualization
│   ├── charts/           # Chart components
│   ├── farmer-logs/      # Farmer log forms and tables
│   ├── icons/            # Custom icons
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── hooks/                # Custom hooks
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── firestore-utils.ts # Firestore utilities
│   ├── csv-utils.ts      # CSV import/export
│   └── pdf-utils.ts      # PDF generation
├── services/             # External services
├── types/                # TypeScript type definitions
└── ai/                   # AI/ML related code
```

## 🔐 User Roles & Permissions

### Admin
- Full access to all features
- User management and role assignment
- System configuration and reports
- Bulk data operations

### Farmer
- Create and edit farmer logs
- View blockchain transactions
- Access price forecasts
- Limited admin features

### Viewer
- Read-only access to most data
- View dashboards and reports
- No editing capabilities

## 📊 Features Overview

### Dashboard
- Real-time metrics and KPIs
- Interactive price prediction charts
- Fertilizer distribution analytics
- Animated metric cards with trend indicators

### Farmer Logs
- Comprehensive activity tracking
- Searchable and filterable data tables
- CSV import/export functionality
- Modal forms for data entry
- Status management (Active, Completed, Pending)

### Blockchain Ledger
- Immutable transaction records
- Visual blockchain representation
- Transaction search and filtering
- Block visualization with transaction details

### Price Forecast
- Historical price trends
- AI-powered price predictions
- Multi-crop support (Wheat, Rice, Maize, Cotton)
- Interactive charts with Recharts
- AI-generated market summaries

### Admin Panel
- User management with role-based access
- Bulk CSV operations for data import/export
- System reports generation (PDF/CSV)
- Application settings and configuration

## 🛠️ Technologies Used

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Headless UI components
- **Recharts** - Chart library for data visualization

### Backend & Database
- **Firebase Authentication** - User authentication
- **Firestore** - NoSQL document database
- **Firebase Storage** - File storage (future use)

### Additional Libraries
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icon library
- **Papa Parse** - CSV parsing
- **jsPDF** - PDF generation
- **html2canvas** - Screenshot functionality

## 🔧 Configuration

### Tailwind CSS Configuration
The project uses a custom Tailwind configuration with:
- Custom color palette
- Animation extensions
- Responsive breakpoints
- Component-specific utilities

### Next.js Configuration
- Optimized build configuration
- Image optimization
- Font optimization with Google Fonts
- Performance optimizations

## 📈 Performance Optimizations

- **Lazy Loading**: Charts and heavy components are lazy loaded
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for optimized images
- **Memoization**: React.memo and useMemo for expensive operations
- **Bundle Optimization**: Tree shaking and minification

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Full support with environment variables
- **Railway**: Easy deployment with automatic HTTPS
- **AWS Amplify**: Full-stack deployment with AWS integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `GOOGLE_GENAI_API_KEY` | Google AI API Key for predictions | Optional |

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all environment variables are set
   - Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

2. **Firebase Authentication Issues**
   - Verify Firebase configuration
   - Check authorized domains in Firebase Console
   - Ensure authentication providers are enabled

3. **Styling Issues**
   - Clear Tailwind cache: `npx tailwindcss-cli build -i ./src/app/globals.css -o ./dist/output.css --purge`
   - Check for conflicting CSS classes

4. **TypeScript Errors**
   - Run type checking: `npx tsc --noEmit`
   - Ensure all dependencies are properly typed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for backend services
- [Vercel](https://vercel.com/) for hosting platform
- [Tailwind CSS](https://tailwindcss.com/) for styling framework
- [Radix UI](https://www.radix-ui.com/) for headless components
- [Recharts](https://recharts.org/) for data visualization

---

Built with ❤️ for modern agricultural management
#   A g r i T r u s t  
 