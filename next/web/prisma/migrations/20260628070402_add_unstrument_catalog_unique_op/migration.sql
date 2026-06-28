/*
  Warnings:

  - A unique constraint covering the columns `[row_id,measuring_tool_id]` on the table `row_measuring_tools` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "row_measuring_tools_row_id_measuring_tool_id_key" ON "row_measuring_tools"("row_id", "measuring_tool_id");
