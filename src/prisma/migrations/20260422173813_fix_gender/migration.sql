/*
  Warnings:

  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[weekId,type]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `gender` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Student` MODIFY `gender` VARCHAR(191) NOT NULL DEFAULT 'M';

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'ADMIN';

-- CreateIndex
CREATE UNIQUE INDEX `Assignment_weekId_type_key` ON `Assignment`(`weekId`, `type`);

-- RenameIndex
ALTER TABLE `Assignment` RENAME INDEX `Assignment_studentId_fkey` TO `Assignment_studentId_idx`;

-- RenameIndex
ALTER TABLE `Assignment` RENAME INDEX `Assignment_weekId_fkey` TO `Assignment_weekId_idx`;
