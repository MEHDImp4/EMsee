const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// ===== CONFIGURATION FOR MASSIVE DATASET =====
const USERS_TO_CREATE = 200;
const POSTS_PER_USER_MIN = 150;
const POSTS_PER_USER_MAX = 180;
const COMMENTS_TO_CREATE = 1500; // ~5% of posts
const REPOSTS_TO_CREATE = 750;
const LIKES_TO_CREATE = 4000;
const FOLLOWS_TO_CREATE = 500;
const BOOKMARKS_TO_CREATE = 400;

// SQLite/Postgres compatibility helper
const isSqlite = process.env.DATABASE_PROVIDER === 'sqlite' || process.env.DATABASE_URL?.startsWith('file:');

function serializeJson(data) {
    if (isSqlite && typeof data === 'object') {
        return JSON.stringify(data);
    }
    return data;
}

async function main() {
    console.log(`\n🚀 Starting MASSIVE seed... (SQLite Mode: ${isSqlite})`);
    console.log(`📊 Expected totals:`);
    console.log(`   - Users: ${USERS_TO_CREATE}`);
    console.log(`   - Posts: ~${USERS_TO_CREATE * ((POSTS_PER_USER_MIN + POSTS_PER_USER_MAX) / 2)}`);
    console.log(`   - Comments: ${COMMENTS_TO_CREATE}`);
    console.log(`   - Reposts: ${REPOSTS_TO_CREATE}`);
    console.log(`   - Likes: ${LIKES_TO_CREATE}`);
    console.log(`   - Follows: ${FOLLOWS_TO_CREATE}`);
    console.log(`   - Bookmarks: ${BOOKMARKS_TO_CREATE}`);
    console.log(`⏱️  This will take approximately 5-10 minutes...\n`);

    const filieres = ['IIR', 'GESI', 'IAII', 'GCB', 'GI', 'GF'];
    const years = ['1', '2', '3', '4', '5'];
    const subjectsList = ['Math', 'Physics', 'Programming', 'Algorithms', 'Databases', 'Networks', 'English', 'Management', 'AI', 'Web Dev'];

    // ========== STEP 1: CREATE USERS ==========
    console.log(`\n📝 Step 1/7: Creating ${USERS_TO_CREATE} users...`);
    const userIds = [];
    let usersCreated = 0;

    for (let i = 0; i < USERS_TO_CREATE; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const username = faker.internet.username({ firstName, lastName }).slice(0, 10).toLowerCase().replace(/[^a-z0-9.]/g, '');
        const uniqueSuffix = faker.string.alphanumeric(3);
        const finalUsername = (username.slice(0, 6) + uniqueSuffix).toLowerCase();

        // 80% students, 15% professors, 5% admins
        const rand = Math.random();
        const role = rand < 0.80 ? 'student' : rand < 0.95 ? 'professor' : 'admin';

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
            created_at: faker.date.past({ years: 2 }),
        };

        if (role === 'student') {
            userData.filiere = faker.helpers.arrayElement(filieres);
            userData.year = faker.helpers.arrayElement(years);
            userData.studentClass = `${userData.filiere}${userData.year} G${faker.number.int({ min: 1, max: 4 })}`;
            userData.subjects = serializeJson(subjects);
        } else {
            userData.subjects = serializeJson(subjects);
        }

        try {
            const user = await prisma.user.create({ data: userData });
            userIds.push(user.id);
            usersCreated++;

            // Progress indicator
            if (usersCreated % 50 === 0) {
                console.log(`   ✅ Created ${usersCreated}/${USERS_TO_CREATE} users...`);
            }
        } catch (e) {
            console.warn(`   ⚠️  Failed to create user ${finalUsername}: ${e.message.split('\n')[0]}`);
        }
    }

    console.log(`✅ Step 1 Complete: Created ${usersCreated} users successfully.\n`);

    // ========== STEP 2: CREATE POSTS ==========
    console.log(`📝 Step 2/7: Creating posts (150-180 per user)...`);
    let totalPostsCreated = 0;
    const postIds = [];

    for (const userId of userIds) {
        const numPosts = faker.number.int({ min: POSTS_PER_USER_MIN, max: POSTS_PER_USER_MAX });

        for (let j = 0; j < numPosts; j++) {
            const contentType = faker.number.int({ min: 1, max: 10 });
            let content;

            // Varied content types
            if (contentType <= 3) {
                // Question
                content = `❓ ${faker.lorem.sentence()}`;
            } else if (contentType <= 6) {
                // Regular post
                content = faker.lorem.paragraph();
            } else if (contentType <= 8) {
                // Short announcement
                content = `📢 ${faker.lorem.sentence()}`;
            } else {
                // Code-related post
                content = `💻 Working on ${faker.helpers.arrayElement(['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js'])} project: ${faker.lorem.sentence()}`;
            }

            try {
                const post = await prisma.post.create({
                    data: {
                        userId: userId,
                        content: content,
                        createdAt: faker.date.recent({ days: 30 }),
                    }
                });
                postIds.push({ id: post.id, userId: userId });
                totalPostsCreated++;
            } catch (e) {
                // Silently skip errors
            }
        }

        // Progress indicator
        if ((userIds.indexOf(userId) + 1) % 25 === 0) {
            console.log(`   ✅ Processed ${userIds.indexOf(userId) + 1}/${userIds.length} users (${totalPostsCreated} posts so far)...`);
        }
    }

    console.log(`✅ Step 2 Complete: Created ${totalPostsCreated} posts.\n`);

    // ========== STEP 3: CREATE HASHTAGS ==========
    console.log(`📝 Step 3/7: Creating hashtags...`);
    const hashtagNames = ['coding', 'emsi', 'exams', 'project', 'javascript', 'python', 'help', 'internship',
        'hackathon', 'party', 'study', 'ai', 'machinelearning', 'webdev', 'devops',
        'cybersecurity', 'dataScience', 'mobile', 'backend', 'frontend'];
    const hashtagIds = {};

    for (const name of hashtagNames) {
        try {
            const hashtag = await prisma.hashtag.create({
                data: { name }
            });
            hashtagIds[name] = hashtag.id;
        } catch (e) {
            const existing = await prisma.hashtag.findUnique({ where: { name } });
            if (existing) hashtagIds[name] = existing.id;
        }
    }
    console.log(`✅ Step 3 Complete: Created ${Object.keys(hashtagIds).length} hashtags.\n`);

    // ========== STEP 4: LINK HASHTAGS TO POSTS ==========
    console.log(`📝 Step 4/7: Linking hashtags to posts...`);
    let hashtagLinksCreated = 0;

    for (const post of postIds) {
        const numHashtags = faker.number.int({ min: 0, max: 3 });
        const selectedHashtags = faker.helpers.arrayElements(Object.keys(hashtagIds), numHashtags);

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
    console.log(`✅ Step 4 Complete: Created ${hashtagLinksCreated} hashtag links.\n`);

    // ========== STEP 5: CREATE COMMENTS ==========
    console.log(`📝 Step 5/7: Creating ${COMMENTS_TO_CREATE} comments...`);
    let commentsCreated = 0;

    if (postIds.length > 0) {
        for (let i = 0; i < COMMENTS_TO_CREATE; i++) {
            const parentPost = postIds[Math.floor(Math.random() * postIds.length)];
            const commenter = userIds[Math.floor(Math.random() * userIds.length)];

            try {
                await prisma.post.create({
                    data: {
                        userId: commenter,
                        content: faker.lorem.sentence(),
                        parentId: parentPost.id,
                        createdAt: faker.date.recent({ days: 25 })
                    }
                });
                commentsCreated++;

                if (commentsCreated % 250 === 0) {
                    console.log(`   ✅ Created ${commentsCreated}/${COMMENTS_TO_CREATE} comments...`);
                }
            } catch (e) {
                // Ignore errors
            }
        }
    }
    console.log(`✅ Step 5 Complete: Created ${commentsCreated} comments.\n`);

    // ========== STEP 6: CREATE INTERACTIONS (Likes, Reposts, Bookmarks) ==========
    console.log(`📝 Step 6/7: Creating interactions...`);
    let likesCreated = 0;
    let repostsCreated = 0;
    let bookmarksCreated = 0;

    // LIKES
    console.log(`   Creating ${LIKES_TO_CREATE} likes...`);
    for (let i = 0; i < LIKES_TO_CREATE; i++) {
        const post = postIds[Math.floor(Math.random() * postIds.length)];
        const availableLikers = userIds.filter(id => id !== post.userId);
        const liker = availableLikers[Math.floor(Math.random() * availableLikers.length)];

        try {
            await prisma.like.create({
                data: {
                    postId: post.id,
                    userId: liker,
                    createdAt: faker.date.recent({ days: 20 })
                }
            });
            likesCreated++;
        } catch (e) {
            // Ignore duplicates
        }

        if (likesCreated % 500 === 0) {
            console.log(`      ✅ Created ${likesCreated}/${LIKES_TO_CREATE} likes...`);
        }
    }

    // REPOSTS
    console.log(`   Creating ${REPOSTS_TO_CREATE} reposts...`);
    for (let i = 0; i < REPOSTS_TO_CREATE; i++) {
        const post = postIds[Math.floor(Math.random() * postIds.length)];
        const availableReposters = userIds.filter(id => id !== post.userId);
        const reposter = availableReposters[Math.floor(Math.random() * availableReposters.length)];

        try {
            await prisma.repost.create({
                data: {
                    postId: post.id,
                    userId: reposter,
                    createdAt: faker.date.recent({ days: 20 })
                }
            });
            repostsCreated++;
        } catch (e) {
            // Ignore duplicates
        }

        if (repostsCreated % 250 === 0) {
            console.log(`      ✅ Created ${repostsCreated}/${REPOSTS_TO_CREATE} reposts...`);
        }
    }

    // BOOKMARKS
    console.log(`   Creating ${BOOKMARKS_TO_CREATE} bookmarks...`);
    for (let i = 0; i < BOOKMARKS_TO_CREATE; i++) {
        const post = postIds[Math.floor(Math.random() * postIds.length)];
        const bookmarker = userIds[Math.floor(Math.random() * userIds.length)];

        try {
            await prisma.bookmark.create({
                data: {
                    postId: post.id,
                    userId: bookmarker,
                    createdAt: faker.date.recent({ days: 20 })
                }
            });
            bookmarksCreated++;
        } catch (e) {
            // Ignore duplicates
        }
    }

    console.log(`✅ Step 6 Complete: Created ${likesCreated} likes, ${repostsCreated} reposts, ${bookmarksCreated} bookmarks.\n`);

    // ========== STEP 7: CREATE FOLLOWS ==========
    console.log(`📝 Step 7/7: Creating ${FOLLOWS_TO_CREATE} follow relationships...`);
    let followsCreated = 0;

    for (let i = 0; i < FOLLOWS_TO_CREATE; i++) {
        const follower = userIds[Math.floor(Math.random() * userIds.length)];
        const availableToFollow = userIds.filter(id => id !== follower);
        const following = availableToFollow[Math.floor(Math.random() * availableToFollow.length)];

        try {
            await prisma.follow.create({
                data: {
                    followerId: follower,
                    followingId: following,
                    createdAt: faker.date.recent({ days: 60 })
                }
            });
            followsCreated++;

            if (followsCreated % 100 === 0) {
                console.log(`   ✅ Created ${followsCreated}/${FOLLOWS_TO_CREATE} follows...`);
            }
        } catch (e) {
            // Ignore duplicates
        }
    }
    console.log(`✅ Step 7 Complete: Created ${followsCreated} follow relationships.\n`);

    // ========== SUMMARY ==========
    const totalItems = usersCreated + totalPostsCreated + commentsCreated + likesCreated +
        repostsCreated + bookmarksCreated + followsCreated + hashtagLinksCreated;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Final Statistics:`);
    console.log(`   👥 Users:           ${usersCreated.toLocaleString()}`);
    console.log(`   📝 Posts:           ${totalPostsCreated.toLocaleString()}`);
    console.log(`   💬 Comments:        ${commentsCreated.toLocaleString()}`);
    console.log(`   ❤️  Likes:           ${likesCreated.toLocaleString()}`);
    console.log(`   🔁 Reposts:         ${repostsCreated.toLocaleString()}`);
    console.log(`   🔖 Bookmarks:       ${bookmarksCreated.toLocaleString()}`);
    console.log(`   👤 Follows:         ${followsCreated.toLocaleString()}`);
    console.log(`   #️⃣  Hashtag links:  ${hashtagLinksCreated.toLocaleString()}`);
    console.log(`   ─────────────────────────────`);
    console.log(`   📦 TOTAL ITEMS:     ${totalItems.toLocaleString()}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`✨ You can now view your data in Prisma Studio!`);
    console.log(`   Run: npx prisma studio\n`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
