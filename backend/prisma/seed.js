const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// Configuration
const USERS_TO_CREATE = 100;
const POSTS_PER_USER_MIN = 1;
const POSTS_PER_USER_MAX = 5;

// SQLite/Postgres compatibility helper
const isSqlite = process.env.DATABASE_PROVIDER === 'sqlite' || process.env.DATABASE_URL?.startsWith('file:');

function serializeJson(data) {
    if (isSqlite && typeof data === 'object') {
        return JSON.stringify(data);
    }
    return data;
}

async function main() {
    console.log(`Starting seed... (SQLite Mode: ${isSqlite})`);

    // Clean up existing data (optional, be careful in prod)
    // await prisma.post.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.hashtag.deleteMany();

    const filieres = ['IIR', 'GESI', 'IAII', 'GCB', 'GI', 'GF'];
    const years = ['1', '2', '3', '4', '5'];
    const subjectsList = ['Math', 'Physics', 'Programming', 'Algorithms', 'Databases', 'Networks', 'English', 'Management'];

    console.log(`Creating ${USERS_TO_CREATE} users...`);

    const userIds = [];

    for (let i = 0; i < USERS_TO_CREATE; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const username = faker.internet.username({ firstName, lastName }).slice(0, 10).toLowerCase().replace(/[^a-z0-9.]/g, '');
        // Ensure unique username by appending random if needed, simpler is using unique email and handling errors, but lets generate safe unique
        const uniqueSuffix = faker.string.alphanumeric(3);
        const finalUsername = (username.slice(0, 6) + uniqueSuffix).toLowerCase();

        const role = faker.helpers.arrayElement(['student', 'student', 'student', 'professor']); // Mostly students

        const subjects = faker.helpers.arrayElements(subjectsList, { min: 1, max: 4 });

        const userData = {
            username: finalUsername,
            email: faker.internet.email({ firstName, lastName, provider: 'emsi-edu.ma' }),
            password: '$2b$10$EpIxT.P3z1/5k.1/5k.1/5k.1/5k.1/5k.1/5k.1/5k.1/5k.1', // "password123" hash (dummy)
            full_name: `${firstName} ${lastName}`,
            role: role,
            bio: faker.person.bio(),
            location: faker.location.city(),
            avatar: faker.image.avatar(),
            banner: faker.image.url({ category: 'abstract' }),
            created_at: faker.date.past(),
        };

        if (role === 'student') {
            userData.filiere = faker.helpers.arrayElement(filieres);
            userData.year = faker.helpers.arrayElement(years);
            userData.studentClass = `${userData.filiere}${userData.year} G${faker.number.int({ min: 1, max: 4 })}`;
            userData.subjects = serializeJson(subjects);
        } else {
            userData.subjects = serializeJson(subjects); // Professors also have subjects taught
        }

        try {
            const user = await prisma.user.create({ data: userData });
            userIds.push(user.id);
            // console.log(`Created user: ${user.username}`);
        } catch (e) {
            console.warn(`Failed to create user ${finalUsername}: ${e.message.split('\n')[0]}`);
        }
    }

    console.log(`Created ${userIds.length} users successfully.`);

    console.log('Creating posts...');

    let totalPostsCreated = 0;
    let totalPostsFailed = 0;

    for (const userId of userIds) {
        const numPosts = faker.number.int({ min: POSTS_PER_USER_MIN, max: POSTS_PER_USER_MAX });

        for (let j = 0; j < numPosts; j++) {
            const content = faker.lorem.paragraph();

            try {
                const post = await prisma.post.create({
                    data: {
                        userId: userId,
                        content: content,
                        createdAt: faker.date.recent(),
                    }
                });
                totalPostsCreated++;
            } catch (e) {
                totalPostsFailed++;
                console.warn(`✗ Failed to create post for user ${userId}: ${e.message}`);
            }
        }
    }

    console.log(`\n=== Seeding Summary ===`);
    console.log(`Users created: ${userIds.length}`);
    console.log(`Posts created: ${totalPostsCreated}`);
    console.log(`Posts failed: ${totalPostsFailed}`);

    // Create hashtags
    console.log(`\nCreating hashtags...`);
    const hashtagNames = ['coding', 'emsi', 'exams', 'project', 'javascript', 'python', 'help', 'internship', 'hackathon', 'party'];
    const hashtagIds = {};

    for (const name of hashtagNames) {
        try {
            const hashtag = await prisma.hashtag.create({
                data: { name }
            });
            hashtagIds[name] = hashtag.id;
        } catch (e) {
            // Hashtag might already exist
            const existing = await prisma.hashtag.findUnique({ where: { name } });
            if (existing) hashtagIds[name] = existing.id;
        }
    }
    console.log(`Created ${Object.keys(hashtagIds).length} hashtags`);

    // Get all created posts
    const allPosts = await prisma.post.findMany({ select: { id: true, userId: true } });
    console.log(`\nAdding interactions...`);

    let likesCreated = 0;
    let repostsCreated = 0;
    let commentsCreated = 0;
    let conversationsCreated = 0;
    let hashtagLinksCreated = 0;

    // Add hashtags to posts (each post gets 0-3 random hashtags)
    for (const post of allPosts) {
        const numHashtags = faker.number.int({ min: 0, max: 3 });
        const selectedHashtags = faker.helpers.arrayElements(Object.keys(hashtagIds), { min: 0, max: numHashtags });

        for (const hashtagName of selectedHashtags) {
            try {
                await prisma.postHashtag.create({
                    data: {
                        postId: post.id,
                        hashtagId: hashtagIds[hashtagName]
                    }
                });
                hashtagLinksCreated++;
            } catch (e) {
                // Ignore duplicates
            }
        }
    }

    // Add likes (each post gets 0-10 random likes)
    for (const post of allPosts) {
        const numLikes = faker.number.int({ min: 0, max: 10 });
        const likers = faker.helpers.arrayElements(userIds.filter(id => id !== post.userId), { min: 0, max: numLikes });

        for (const likerId of likers) {
            try {
                await prisma.like.create({
                    data: {
                        postId: post.id,
                        userId: likerId,
                        createdAt: faker.date.recent()
                    }
                });
                likesCreated++;
            } catch (e) {
                // Ignore duplicate likes
            }
        }
    }

    // Add reposts (some posts get reposted)
    const postsToRepost = faker.helpers.arrayElements(allPosts, { min: 10, max: 30 });
    for (const post of postsToRepost) {
        const reposter = faker.helpers.arrayElement(userIds.filter(id => id !== post.userId));
        try {
            await prisma.repost.create({
                data: {
                    postId: post.id,
                    userId: reposter,
                    createdAt: faker.date.recent()
                }
            });
            repostsCreated++;
        } catch (e) {
            // Ignore duplicates
        }
    }

    // Add comments (replies to posts)
    const postsToComment = faker.helpers.arrayElements(allPosts, { min: 20, max: 50 });
    for (const post of postsToComment) {
        const numComments = faker.number.int({ min: 1, max: 3 });
        for (let i = 0; i < numComments; i++) {
            const commenter = faker.helpers.arrayElement(userIds);
            try {
                await prisma.post.create({
                    data: {
                        userId: commenter,
                        content: faker.lorem.sentence(),
                        parentId: post.id,
                        createdAt: faker.date.recent()
                    }
                });
                commentsCreated++;
            } catch (e) {
                // Ignore errors
            }
        }
    }

    // Add some conversations between users
    const numConversations = 20;
    for (let i = 0; i < numConversations; i++) {
        const [user1, user2] = faker.helpers.arrayElements(userIds, 2);

        try {
            // Create conversation
            const conversation = await prisma.conversation.create({
                data: {
                    participants: {
                        create: [
                            { userId: user1 },
                            { userId: user2 }
                        ]
                    }
                }
            });
            conversationsCreated++;
        } catch (e) {
            console.warn(`Failed to create conversation: ${e.message.split('\n')[0]}`);
        }
    }

    console.log(`\nInteractions created:`);
    console.log(`- Likes: ${likesCreated}`);
    console.log(`- Reposts: ${repostsCreated}`);
    console.log(`- Comments: ${commentsCreated}`);
    console.log(`- Hashtag links: ${hashtagLinksCreated}`);
    console.log(`- Conversations: ${conversationsCreated}`);
    console.log('\nSeeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
