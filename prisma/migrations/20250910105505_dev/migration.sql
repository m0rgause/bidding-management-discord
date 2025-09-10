/*
  Warnings:

  - You are about to alter the column `budget` on the `project` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."project" ADD COLUMN     "priced" INTEGER DEFAULT 0,
ALTER COLUMN "budget" SET DATA TYPE INTEGER;
