/*
  Warnings:

  - You are about to drop the column `externalCustId` on the `Invoice` table. All the data in the column will be lost.
  - The `externalId` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[externalCustId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "externalCustId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "externalCustId",
DROP COLUMN "externalId",
ADD COLUMN     "externalId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_externalCustId_key" ON "Customer"("externalCustId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_externalId_key" ON "Invoice"("externalId");
