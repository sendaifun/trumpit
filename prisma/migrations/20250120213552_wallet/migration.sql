/*
  Warnings:

  - A unique constraint covering the columns `[wallet_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wallet_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "wallet_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_id_key" ON "User"("wallet_id");
