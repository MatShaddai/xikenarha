# Laptop Tracking System Backend

NestJS backend API for the Municipal Building Laptop Tracking System.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/       # JWT strategies
│   │   └── guards/           # Authentication guards
│   ├── logs/                # Log entries module
│   │   ├── logs.controller.ts
│   │   ├── logs.service.ts
│   │   ├── logs.module.ts
│   │   └── entities/        # Log entity
│   ├── employees/           # Employees module
│   │   ├── employees.controller.ts
│   │   ├── employees.service.ts
│   │   ├── employees.module.ts
│   │   └── entities/        # Employee entity
│   ├── statistics/          # Statistics module
│   │   ├── statistics.controller.ts
│   │   ├── statistics.service.ts
│   │   └── statistics.module.ts
│   ├── common/              # Common utilities
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/    # Response interceptors
│   │   ├── decorators/      # Custom decorators
│   │   └── pipes/           # Validation pipes
│   ├── config/              # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── test/                    # Test files
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL or MongoDB
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/laptop_tracking
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-token-secret
   PORT=3000
   NODE_ENV=development
   ```

3. **Set up database**
   ```bash
   # For PostgreSQL
   npm run db:create
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## 📋 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Logs
- `GET /logs` - Get all log entries (with filtering)
- `POST /logs` - Create new log entry
- `GET /logs/:id` - Get specific log entry
- `GET /logs/export` - Export logs to CSV
- `POST /logs/bulk` - Create bulk log entries

### Employees
- `GET /employees` - Get all employees
- `POST /employees` - Create new employee
- `GET /employees/:id` - Get specific employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Statistics
- `GET /statistics/daily` - Daily statistics
- `GET /statistics/weekly` - Weekly statistics
- `GET /statistics/overview` - Overview dashboard

## 🔧 Configuration

### Database
The application supports both PostgreSQL and MongoDB. Configure in `.env`:

```env
# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/laptop_tracking

# MongoDB
MONGODB_URI=mongodb://localhost:27017/laptop_tracking
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build

# Or build individually
docker build -t laptop-tracking-backend .
docker run -p 3000:3000 laptop-tracking-backend
```

### Manual Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Start with PM2: `pm2 start dist/main.js`

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 📊 Database Schema

### Users Table
```sql
id: string (PK)
email: string (unique)
password: string
name: string
role: string ('admin', 'user')
createdAt: DateTime
updatedAt: DateTime
```

### Employees Table
```sql
id: string (PK)
name: string
department: string
email: string
createdAt: DateTime
updatedAt: DateTime
```

### Logs Table
```sql
id: string (PK)
deviceId: string
employeeName: string
action: string ('entry', 'exit')
timestamp: DateTime
createdAt: DateTime
```

## 🤝 API Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Operation successful",
  "status": 200
}
```

### Error Response
```json
{
  "message": "Error description",
  "status": 400,
  "errors": {
    "field": ["Error message"]
  }
}
```

## 🚦 Rate Limiting

The API includes rate limiting to prevent abuse:
- 100 requests per 15 minutes for authenticated users
- 10 requests per 15 minutes for unauthenticated endpoints

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the [API documentation](#)
2. Create an issue in the GitHub repository
3. Contact the development team

---

**Note**: This backend is designed to work with the React Native Laptop Tracking System frontend. Ensure proper CORS configuration for cross-origin requests.
