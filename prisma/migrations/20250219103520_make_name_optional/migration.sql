/*
  Warnings:

  - Added the required column `mobile_no` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mobile_no" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;
