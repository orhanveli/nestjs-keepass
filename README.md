# Passkey Authentication Backend

A secure backend service implementing WebAuthn/Passkey authentication using NestJS and PostgreSQL.

## Features

- WebAuthn/Passkey authentication
- JWT-based session management
- PostgreSQL database with TypeORM
- Docker support for development
- Comprehensive test coverage
- TypeScript with strict type checking

## Prerequisites

- Node.js (>=20.0.0)
- PostgreSQL (>=15)
- Docker and Docker Compose (optional)

## Development Setup

### Using Docker (Recommended)

1. Start the PostgreSQL database:

```bash
docker-compose up -d
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Install dependencies:

```bash
npm install
```

4. Run database migrations:

```bash
npm run migration:run
```

5. Start the development server:

```bash
npm run start:dev
```

### Manual Setup

1. Install PostgreSQL 15 or higher
2. Create a database and user:

```sql
CREATE DATABASE passkeys_db;
CREATE USER passkeys WITH PASSWORD 'passkeys';
GRANT ALL PRIVILEGES ON DATABASE passkeys_db TO passkeys;
```

3. Follow steps 2-5 from Docker setup

## Available Scripts

### Development

```bash
# Start in development mode with watch
npm run start:dev

# Start in debug mode
npm run start:debug

# Start in production mode
npm run start:prod
```

### Database Management

```bash
# Generate a new migration
npm run migration:generate src/migrations/[MigrationName]

# Create an empty migration
npm run migration:create src/migrations/[MigrationName]

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── entities/        # Database entities
│   ├── dto/            # Data Transfer Objects
│   └── ...
├── config/             # Configuration
│   ├── database.config.ts
│   └── ...
├── migrations/         # Database migrations
└── common/            # Shared resources
    └── entities/      # Base entities
```

## Environment Variables

```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=passkeys
DB_PASSWORD=passkeys
DB_DATABASE=passkeys_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600
```

## API Documentation

Once the application is running, visit `/api` for the Swagger documentation.

## Database Migrations

The project uses TypeORM for database management. Key concepts:

1. Entities are in `src/*/entities/`
2. Migrations are in `src/migrations/`
3. Configuration in `src/config/data-source.ts`

### Creating a New Migration

```bash
# After making entity changes
npm run migration:generate src/migrations/DescriptiveChangeName

# Review generated migration
# Then apply it
npm run migration:run
```

## Testing

The project includes both unit and E2E tests:

- Unit tests are alongside the source files (`*.spec.ts`)
- E2E tests are in the `test` directory
- Use `npm run test:cov` to check coverage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is MIT licensed.
