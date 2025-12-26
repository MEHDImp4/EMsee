const { PrismaClient } = require('@prisma/client');

let prisma = new PrismaClient();

// Check if running in local SQLite mode (passed via env)
console.log('[DB_DEBUG] Env:', process.env.DATABASE_PROVIDER);
const isSqliteLocal = process.env.DATABASE_PROVIDER === 'sqlite';
console.log('[DB_DEBUG] isSqliteLocal:', isSqliteLocal);

if (isSqliteLocal) {
    console.log('[DEV:LOCAL] Initializing Prisma with SQLite JSON polyfill');
    prisma = prisma.$extends({
        result: {
            user: {
                subjects: {
                    needs: { subjects: true },
                    compute(user) {
                        // Deserialize JSON string back to object
                        if (!user.subjects) return null;
                        try {
                            return JSON.parse(user.subjects);
                        } catch (e) {
                            return user.subjects;
                        }
                    }
                }
            }
        }
    });
}

prisma.isSqliteLocal = isSqliteLocal;
module.exports = prisma;
