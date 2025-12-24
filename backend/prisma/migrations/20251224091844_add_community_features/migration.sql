/*
  Warnings:

  - You are about to drop the column `commentId` on the `notifications` table. All the data in the column will be lost.
  - The values [COMMENT] on the enum `notifications_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `comment_hashtags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment_reposts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment_saves` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `comment_hashtags` DROP FOREIGN KEY `comment_hashtags_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_hashtags` DROP FOREIGN KEY `comment_hashtags_hashtagId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_likes` DROP FOREIGN KEY `comment_likes_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_likes` DROP FOREIGN KEY `comment_likes_userId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_reposts` DROP FOREIGN KEY `comment_reposts_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_reposts` DROP FOREIGN KEY `comment_reposts_userId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_saves` DROP FOREIGN KEY `comment_saves_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_saves` DROP FOREIGN KEY `comment_saves_userId_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_parentCommentId_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_postId_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_userId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_commentId_fkey`;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `commentId`,
    MODIFY `type` ENUM('MENTION', 'LIKE', 'REPOST', 'FOLLOW', 'SYSTEM') NOT NULL;

-- DropTable
DROP TABLE `comment_hashtags`;

-- DropTable
DROP TABLE `comment_likes`;

-- DropTable
DROP TABLE `comment_reposts`;

-- DropTable
DROP TABLE `comment_saves`;

-- DropTable
DROP TABLE `comments`;

-- CreateTable
CREATE TABLE `bookmarks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bookmarks_postId_userId_key`(`postId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(191) NULL,
    `banner` VARCHAR(191) NULL,
    `privacy` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    `writeAccess` ENUM('EVERYONE', 'ADMINS_ONLY') NOT NULL DEFAULT 'EVERYONE',
    `ownerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `communities_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `communityId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'MEMBER', 'MODERATOR') NOT NULL DEFAULT 'MEMBER',
    `status` ENUM('ACTIVE', 'PENDING', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `community_members_userId_idx`(`userId`),
    UNIQUE INDEX `community_members_communityId_userId_key`(`communityId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `communityId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `content` TEXT NULL,
    `mediaUrl` VARCHAR(191) NULL,
    `mediaType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `community_messages_communityId_idx`(`communityId`),
    INDEX `community_messages_senderId_idx`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communities` ADD CONSTRAINT `communities_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_communityId_fkey` FOREIGN KEY (`communityId`) REFERENCES `communities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_members` ADD CONSTRAINT `community_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_messages` ADD CONSTRAINT `community_messages_communityId_fkey` FOREIGN KEY (`communityId`) REFERENCES `communities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_messages` ADD CONSTRAINT `community_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
