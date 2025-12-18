-- AlterTable
ALTER TABLE `messages` ADD COLUMN `mediaType` VARCHAR(191) NULL,
    ADD COLUMN `mediaUrl` VARCHAR(191) NULL,
    ADD COLUMN `readAt` DATETIME(3) NULL,
    MODIFY `content` TEXT NULL;
