-- AlterTable
ALTER TABLE `notifications` MODIFY `type` ENUM('MENTION', 'LIKE', 'REPOST', 'COMMENT', 'FOLLOW', 'SYSTEM') NOT NULL;
