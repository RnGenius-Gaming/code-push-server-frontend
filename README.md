# CodePush Server - Frontend

React + Vite dashboard for CodePush Server.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on http://localhost:5173

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
```

For production, create `.env.production`:

```env
VITE_API_URL=https://your-backend-api.herokuapp.com/api
```

## Deploy to Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed
- Backend API deployed

### Deployment Steps

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name-web

# Set environment variables
heroku config:set VITE_API_URL="https://your-app-name-api.herokuapp.com/api"

# Deploy
git push heroku main

# Scale dyno
heroku ps:scale web=1

# Open app
heroku open
```

### Check logs

```bash
heroku logs --tail
```

## Features

- User authentication
- Deployment management
- Package upload and management
- Gradual rollout control
- Download packages
- Enable/disable packages
- Responsive UI with Ant Design

## Tech Stack

- React 18
- TypeScript
- Vite
- Ant Design
- React Router
- Axios

## License

MIT
