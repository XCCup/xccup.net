-- Neue Piloten
-- 43
select count(*) from "Users" where "createdAt" >= '2023-01-01'::date

-- Piloten Geschlecht
-- 83
select count(*) from "Users" where gender = 'F'
-- 873
select count(*) from "Users" where gender = 'M'

-- Eingereichte Flüge, davon in Wertung
select count(*) from "Flights" where "createdAt" >= '2023-01-01'::date
-- 1712
select count(*) from "Flights" where "createdAt" >= '2023-01-01'::date and "flightStatus" = 'In Wertung'
-- 995

-- Meisten Startplätze
SELECT "siteId", COUNT("siteId") AS "Anzahl", "FlyingSites"."name"
FROM "Flights"
JOIN "FlyingSites" ON "Flights"."siteId" = "FlyingSites"."id"
where "Flights"."createdAt" >= '2023-01-01'::date and "flightStatus" = 'In Wertung' 
GROUP BY "Flights"."siteId", "FlyingSites"."name"
ORDER BY "Anzahl" DESC;
-- Nur In Wertung
-- 100	"Bremm"
-- 71	"Königstuhl"
-- 68	"Zeltingen-Rachtig"
-- 68	"Asslar Schlepp"
-- 57	"Wasserkuppe Westhang"
-- 54	"Hinterweiler UL-Schlepp"
-- 44	"Wenholthausen"
-- 41	"Schriesheim-Ölberg"
-- 24	"Blättersberg"
-- 23	"Burgen"

-- Alle
-- 143	"Bremm"
-- 124	"Zeltingen-Rachtig"
-- 117	"Königstuhl"
-- 94	"Asslar Schlepp"
-- 89	"Wasserkuppe Westhang"
-- 80	"Schriesheim-Ölberg"
-- 75	"Hinterweiler UL-Schlepp"
-- 59	"Wenholthausen"
-- 46	"Burgen"
-- 45	"Klüsserath"


-- Meisten Schirmtypen
select * from 
	(select count(*) as ab_low from "Flights" where "createdAt" >= '2023-01-01'::date and "flightStatus" = 'In Wertung' and glider->'gliderClass'->>'key' = 'AB_low') as a,
	(select count(*) as ab_high from "Flights" where "createdAt" >= '2023-01-01'::date and "flightStatus" = 'In Wertung' and glider->'gliderClass'->>'key' = 'AB_high') as b,
	(select count(*) as c_low from "Flights" where "createdAt" >= '2023-01-01'::date and "flightStatus" = 'In Wertung' and glider->'gliderClass'->>'key' = 'C_low') as c,
	(select count(*) as c_high from "Flights" where "createdAt" >= '2023-01-01'::date and "flightStatus" = 'In Wertung' and glider->'gliderClass'->>'key' = 'C_high') as d,
	(select count(*) as d_low from "Flights" where "createdAt" >= '2023-01-01'::date and "flightStatus" = 'In Wertung' and glider->'gliderClass'->>'key' = 'D_low') as e,
	(select count(*) as d_high from "Flights" where "createdAt" >= '2023-01-01'::date and "flightStatus" = 'In Wertung' and glider->'gliderClass'->>'key' = 'D_high') as f;

-- 24	
-- 287	
-- 235	
-- 113	
-- 201	
-- 45