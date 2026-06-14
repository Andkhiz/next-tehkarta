-- CreateTable
CREATE TABLE "route_cards" (
    "id" SERIAL NOT NULL,
    "document_number" TEXT NOT NULL,
    "part_name" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "mass_kg" DOUBLE PRECISION NOT NULL,
    "profile_size" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" SERIAL NOT NULL,
    "route_card_id" INTEGER NOT NULL,
    "operation_number" TEXT NOT NULL,
    "operation_name" TEXT NOT NULL,
    "workplace" TEXT,
    "equipment" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_rows" (
    "id" SERIAL NOT NULL,
    "operation_id" INTEGER NOT NULL,
    "row_type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "operation_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "route_cards_document_number_key" ON "route_cards"("document_number");

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_route_card_id_fkey" FOREIGN KEY ("route_card_id") REFERENCES "route_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_rows" ADD CONSTRAINT "operation_rows_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
