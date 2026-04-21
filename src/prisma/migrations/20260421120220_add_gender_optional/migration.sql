-- DropForeignKey
ALTER TABLE `Assignment` DROP FOREIGN KEY `Assignment_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `Assignment` DROP FOREIGN KEY `Assignment_weekId_fkey`;

-- AlterTable
ALTER TABLE `Assignment` ADD COLUMN `declineReason` VARCHAR(191) NULL,
    ADD COLUMN `declined` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `encouragementNote` VARCHAR(191) NULL,
    ADD COLUMN `needsEncouragement` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `gender` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Week` ADD COLUMN `hasDemonstration` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `Week`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
