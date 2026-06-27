/*
  Warnings:

  - You are about to drop the `operation_cutting_tools` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `operation_measuring_tools` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "operation_cutting_tools" DROP CONSTRAINT "operation_cutting_tools_cutting_tool_id_fkey";

-- DropForeignKey
ALTER TABLE "operation_cutting_tools" DROP CONSTRAINT "operation_cutting_tools_operation_id_fkey";

-- DropForeignKey
ALTER TABLE "operation_measuring_tools" DROP CONSTRAINT "operation_measuring_tools_measuring_tool_id_fkey";

-- DropForeignKey
ALTER TABLE "operation_measuring_tools" DROP CONSTRAINT "operation_measuring_tools_operation_id_fkey";

-- DropTable
DROP TABLE "operation_cutting_tools";

-- DropTable
DROP TABLE "operation_measuring_tools";

-- CreateTable
CREATE TABLE "row_cutting_tools" (
    "id" SERIAL NOT NULL,
    "row_id" INTEGER NOT NULL,
    "cutting_tool_id" INTEGER NOT NULL,

    CONSTRAINT "row_cutting_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "row_measuring_tools" (
    "id" SERIAL NOT NULL,
    "row_id" INTEGER NOT NULL,
    "measuring_tool_id" INTEGER NOT NULL,

    CONSTRAINT "row_measuring_tools_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "row_cutting_tools" ADD CONSTRAINT "row_cutting_tools_row_id_fkey" FOREIGN KEY ("row_id") REFERENCES "operation_rows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "row_cutting_tools" ADD CONSTRAINT "row_cutting_tools_cutting_tool_id_fkey" FOREIGN KEY ("cutting_tool_id") REFERENCES "cutting_tool_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "row_measuring_tools" ADD CONSTRAINT "row_measuring_tools_row_id_fkey" FOREIGN KEY ("row_id") REFERENCES "operation_rows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "row_measuring_tools" ADD CONSTRAINT "row_measuring_tools_measuring_tool_id_fkey" FOREIGN KEY ("measuring_tool_id") REFERENCES "measuring_tool_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
