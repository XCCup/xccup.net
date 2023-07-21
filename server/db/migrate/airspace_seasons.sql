ALTER TABLE "Airspaces" ADD COLUMN seasons INTEGER[];

ALTER TABLE "Airspaces" DROP COLUMN season;

UPDATE "Airspaces" SET seasons = ARRAY[2022] where 1=1;