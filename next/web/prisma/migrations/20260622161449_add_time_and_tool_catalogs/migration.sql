-- AlterTable
ALTER TABLE "operations" ADD COLUMN     "time_standard" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "cutting_tool_catalog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "cutting_tool_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measuring_tool_catalog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "measuring_tool_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_cutting_tools" (
    "operation_id" INTEGER NOT NULL,
    "cutting_tool_id" INTEGER NOT NULL,

    CONSTRAINT "operation_cutting_tools_pkey" PRIMARY KEY ("operation_id","cutting_tool_id")
);

-- CreateTable
CREATE TABLE "operation_measuring_tools" (
    "operation_id" INTEGER NOT NULL,
    "measuring_tool_id" INTEGER NOT NULL,

    CONSTRAINT "operation_measuring_tools_pkey" PRIMARY KEY ("operation_id","measuring_tool_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cutting_tool_catalog_name_key" ON "cutting_tool_catalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "measuring_tool_catalog_name_key" ON "measuring_tool_catalog"("name");

-- AddForeignKey
ALTER TABLE "operation_cutting_tools" ADD CONSTRAINT "operation_cutting_tools_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_cutting_tools" ADD CONSTRAINT "operation_cutting_tools_cutting_tool_id_fkey" FOREIGN KEY ("cutting_tool_id") REFERENCES "cutting_tool_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_measuring_tools" ADD CONSTRAINT "operation_measuring_tools_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_measuring_tools" ADD CONSTRAINT "operation_measuring_tools_measuring_tool_id_fkey" FOREIGN KEY ("measuring_tool_id") REFERENCES "measuring_tool_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
