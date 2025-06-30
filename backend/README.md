# CV Resumer SaaS - Monorepo

Complete SaaS platform for CV optimization and generation using AI.

## 🏗️ Project Structure

```
cv-resumer/
├── backend/          # Node.js + TypeScript API
│   ├── src/         # Backend source code
│   ├── prisma/      # Database schema & migrations
│   └── dist/        # Compiled backend
├── frontend/         # React + TypeScript UI
│   ├── src/         # Frontend source code
│   ├── public/      # Static assets
│   └── build/       # Production build
└── package.json     # Monorepo scripts
```

## 🚀 Quick Start

### Development

```bash
# Install all dependencies
npm run install-all

# Start backend in development mode
npm run dev-backend

# Start frontend in development mode (in another terminal)
npm run dev-frontend
```

### Production Build

```bash
# Build everything for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

The application is deployed as a unified service:

- **Production URL**: https://resumer.novalabss.com
- **API Endpoints**: https://resumer.novalabss.com/api/*
- **Frontend Routes**: https://resumer.novalabss.com/*

### Coolify Configuration

```yaml
# Build command:
npm run install-all && npm run build

# Start command:
npm start
```

## 📚 API Documentation

- Health Check: `GET /health`
- API Status: `GET /api/status`
- Authentication: `POST /api/auth/*`
- Profile Management: `GET|POST /api/profile/*`
- CV Processing: `POST /api/cv/*`
- AI Generation: `POST /api/generate/*`

## 🧪 Testing

```bash
# Test backend
npm run test-backend

# Test frontend
npm run test-frontend

# Test everything
npm test
```

## 📋 Available Scripts

- `npm run install-all` - Install dependencies for both apps
- `npm run build` - Build both frontend and backend
- `npm start` - Start production server
- `npm run dev` - Start backend in development
- `npm run dev-frontend` - Start frontend in development
- `npm run clean` - Clean all build artifacts
- `npm run fresh-install` - Clean install and build

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
REDIS_URL=redis://...
```

### Frontend (.env)
```
REACT_APP_API_URL=https://resumer.novalabss.com
```

## 📝 License

MIT