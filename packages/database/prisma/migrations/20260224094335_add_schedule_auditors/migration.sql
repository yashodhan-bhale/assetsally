-- CreateTable
CREATE TABLE "_ScheduleAuditors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ScheduleAuditors_AB_unique" ON "_ScheduleAuditors"("A", "B");

-- CreateIndex
CREATE INDEX "_ScheduleAuditors_B_index" ON "_ScheduleAuditors"("B");

-- AddForeignKey
ALTER TABLE "_ScheduleAuditors" ADD CONSTRAINT "_ScheduleAuditors_A_fkey" FOREIGN KEY ("A") REFERENCES "LocationSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleAuditors" ADD CONSTRAINT "_ScheduleAuditors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
