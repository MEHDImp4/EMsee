const { PrismaClient } = require('@prisma/client');

let prisma = new PrismaClient();

// Check if running in local SQLite mode (passed via flag)
const isSqliteLocal = process.argv.includes('--sqlite');

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
        },
        query: {
            user: {
                create({ args, query }) {
                    if (args.data.subjects && typeof args.data.subjects === 'object') {
                        args.data.subjects = JSON.stringify(args.data.subjects);
                    }
                    return query(args);
                },
                update({ args, query }) {
                    if (args.data.subjects && typeof args.data.subjects === 'object') {
                        args.data.subjects = JSON.stringify(args.data.subjects);
                    }
                    return query(args);
                },
                upsert({ args, query }) {
                    if (args.create.subjects && typeof args.create.subjects === 'object') {
                        args.create.subjects = JSON.stringify(args.create.subjects);
                    }
                    if (args.update.subjects && typeof args.update.subjects === 'object') {
                        args.update.subjects = JSON.stringify(args.update.subjects);
                    }
                    return query(args);
                }
            }
        }
    });
}

module.exports = prisma;
