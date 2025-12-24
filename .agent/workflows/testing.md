---
description: How to test the application with test credentials
---

# Test Credentials

When testing the application, use these credentials:

## Test Account
- **Username**: `testuser`
- **Email**: `test@emsi-edu.ma`
- **Password**: `Testuser123`

## Running the App

// turbo-all

1. Start the dev server:
```bash
npm run dev
```

2. Database migrations are applied automatically on startup.

3. If the database was reset, register a new account or use the test credentials above.

## Common Issues

- **Foreign key constraint**: Log out and log back in (token may reference old user ID after DB reset).
- **Modal not visible**: Check CSS animations (opacity issues).
- **500 errors on API**: Check backend logs for Prisma errors.
