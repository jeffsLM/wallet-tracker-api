<h1 align="center">Wallet Tracker API</h1>
<p align="center">Complete Family Financial Control System</p>

<div align="center">

![Badge](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Badge](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Badge](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![Badge](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

</div>

<div align="center">

![Badge](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Badge](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Badge](https://img.shields.io/badge/QStash-FF6B6B?style=for-the-badge&logo=upstash&logoColor=white)

</div>

## About Wallet Tracker API

Wallet Tracker API is a comprehensive solution that centralizes and manages family financial data from multiple sources. It provides endpoints for handling families, users, accounts, payers, transactions, and account balances, enabling complete financial control without being tied to a single financial institution.

The system integrates with QStash for reliable message queuing in WhatsApp transaction processing, ensuring robust handling of OCR operations and financial data extraction.

## Architectural Pattern

The Wallet Tracker API follows clean architecture principles with clear separation of concerns:

- **Controllers**: Handle HTTP requests and delegate to services
- **Services**: Contain business logic and rules
- **Repositories**: Responsible for data persistence and querying
- **DTOs**: Data Transfer Objects with Zod validation
- **Middlewares**: Input validation and error handling
- **Queue System**: QStash integration for WhatsApp transaction processing

## Environment Configuration

Configure your environment variables in the .env file:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/database

# QStash Configuration
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key
```

## Installation and Setup

```bash
# Install dependencies
yarn install

# Generate Prisma client
yarn prisma:generate

# Run database migrations
yarn prisma:migrate

# Start development server
yarn dev
```

## API Endpoints

Wallet Tracker API is organized into 6 main resource controllers:

- `/api/v1/families` - Family management operations including creation, updates, and user/account associations
- `/api/v1/users` - User management within families, including profile and contact information
- `/api/v1/accounts` - Account management for different types (Credit, Debit, Meal vouchers, etc.)
- `/api/v1/payers` - Payment source management for transaction attribution
- `/api/v1/transactions` - Complete transaction management with filtering and installments
- `/api/v1/balances` - Account balance tracking with competence date management

## Key Features

### Core Financial Management
- **Family-based Organization**: Multi-family support with user and account isolation
- **Multiple Account Types**: Support for credit, debit, meal vouchers, and custom account types
- **Transaction Management**: Complete CRUD operations with installment support
- **Balance Tracking**: Historical balance management with competence periods

### Integration & Processing
- **OCR Integration**: Text extraction from transaction receipts via WhatsApp plugin
- **QStash Queue System**: Reliable background job processing for WhatsApp transaction integration

### Data Quality & Validation
- **Advanced Filtering**: Date ranges, account-specific, and user-specific transaction queries
- **Input Validation**: Comprehensive Zod schema validation for all endpoints
- **Clean Architecture**: Separation of concerns with dependency injection

### Reliability & Performance
- **Message Queue**: Asynchronous processing of WhatsApp transaction integration
- **Retry Mechanisms**: Automatic retry for failed OCR operations via QStash

## QStash Integration

The application uses QStash for reliable background processing of WhatsApp transaction integration, ensuring robust handling of OCR operations and message processing from the WhatsApp plugin.

## Related Projects

- [Plugin Wallet Tracker](https://github.com/jeffsLM/wallet-tracker-plugin) - WhatsApp plugin

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT © [jeffsLM](https://github.com/jeffsLM)
