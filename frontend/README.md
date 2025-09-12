# Smart Bus Management Platform

A comprehensive full-stack application for managing public transportation systems with real-time bus tracking, user feedback, lost & found, rewards system, and comprehensive admin tools.

## 🚀 Features

### User Features
- **Real-time Bus Tracking**: Live location and status updates for all buses
- **Feedback System**: Submit complaints, suggestions, compliments, and accessibility reports
- **Lost & Found**: Report lost items or browse found items
- **Rewards & Achievements**: Earn points and unlock achievements for active participation
- **User Dashboard**: Personalized dashboard with activity overview and quick actions
- **Profile Management**: Manage personal information and preferences
- **Notifications**: Real-time updates and system notifications

### Admin Features
- **Analytics Dashboard**: Comprehensive insights into system usage and performance
- **User Management**: View and manage user accounts and permissions
- **Feedback Management**: Review, respond to, and resolve user feedback
- **Lost & Found Management**: Facilitate matches and coordinate item returns
- **Batch Operations**: Upload and manage large datasets
- **System Monitoring**: Real-time monitoring of buses and routes

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend (Production Setup)
- **FastAPI** (Python) for RESTful API
- **Firestore** (NoSQL) for data storage
- **JWT Authentication** for security
- **Real-time updates** with WebSockets

### Current Implementation
- Mock API services for demonstration
- TypeScript interfaces for type safety
- Modular architecture for scalability
- Responsive design for all devices


## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Auth/            # Authentication components
│   ├── Common/          # Reusable components
│   ├── Dashboard/       # Dashboard components
│   ├── Layout/          # Layout components
│   └── BusTracking/     # Bus tracking features
├── contexts/            # React contexts
├── lib/                 # API and utilities (now includes utils.ts)
├── config.ts            # Centralized config (API URLs, etc.)
├── constants.ts         # User-facing messages and magic strings
├── types/               # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-bus-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```


## 🔧 Production Setup

### Backend Setup (FastAPI)

1. **Create Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install FastAPI dependencies**
   ```bash
   pip install fastapi uvicorn firebase-admin python-jose[cryptography] python-multipart
   ```

3. **Set up Firestore**
   - Create a Firebase project
   - Enable Firestore database
   - Generate service account key
   - Set up authentication

4. **Environment variables**
   ```env
   FIREBASE_CREDENTIALS_PATH=path/to/serviceAccountKey.json
   JWT_SECRET_KEY=your-secret-key
   JWT_ALGORITHM=HS256
   ```

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_CONFIG=your-firebase-config
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563EB)
- **Secondary**: Green (#059669)  
- **Accent**: Orange (#EA580C)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font Family**: System fonts for optimal performance
- **Heading Weights**: 600, 700, 800
- **Body Text**: 400, 500
- **Line Heights**: 1.2 for headings, 1.5 for body text

### Spacing System
- **Base Unit**: 8px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- Rate limiting
- Secure password hashing
- XSS protection

## ♿ Accessibility Features

- ARIA labels and roles
- Keyboard navigation support
- Screen reader optimization
- High contrast mode
- Large text options
- Focus management
- Alternative text for images

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- Touch-friendly interface
- Optimized for various screen sizes

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Deployment
- Deploy FastAPI to platforms like Heroku, Vercel, or AWS
- Configure Firestore for production
- Set up environment variables
- Enable HTTPS
- Configure CORS for production domains

## 📊 Monitoring and Analytics

- Real-time system metrics
- User engagement tracking
- Performance monitoring
- Error tracking and logging
- Usage analytics and reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic commit messages
- Write comprehensive tests
- Update documentation
- Follow accessibility guidelines

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🚧 Future Enhancements

- **Real-time Chat**: Communication between users and drivers
- **Route Optimization**: AI-powered route planning
- **Mobile App**: Native iOS and Android applications
- **IoT Integration**: Smart bus sensors and devices
- **Multi-language Support**: Internationalization
- **Payment Integration**: Digital ticketing system
- **Social Features**: User communities and sharing
- **Advanced Analytics**: Machine learning insights

---

Built with ❤️ for the Smart Bus community