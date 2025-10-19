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


-- ============================================
-- JAHRESSTATISTIKEN (Pro Jahr)
-- ============================================

-- Anzahl Clubs pro Jahr (basierend auf participantInSeasons)
SELECT 
  season AS year,
  COUNT(*) AS club_count
FROM "Clubs",
LATERAL unnest("participantInSeasons") AS season
GROUP BY season
ORDER BY season DESC;

-- Anzahl Flüge pro Jahr (gesamt und in Wertung)
SELECT 
  EXTRACT(YEAR FROM "createdAt") AS year,
  COUNT(*) AS flight_count,
  COUNT(*) FILTER (WHERE "flightStatus" = 'In Wertung') AS flights_in_wertung
FROM "Flights"
GROUP BY EXTRACT(YEAR FROM "createdAt")
ORDER BY year DESC;

-- Anzahl aktiver User pro Jahr (User mit mindestens einem Flug)
SELECT 
  EXTRACT(YEAR FROM f."createdAt") AS year,
  COUNT(DISTINCT f."userId") AS active_users,
  COUNT(DISTINCT f."userId") FILTER (WHERE f."flightStatus" = 'In Wertung') AS users_with_wertung
FROM "Flights" f
GROUP BY EXTRACT(YEAR FROM f."createdAt")
ORDER BY year DESC;

-- Längster Flug pro Jahr mit Pilot-Name und Flight-ID
WITH max_flights AS (
  SELECT DISTINCT ON (EXTRACT(YEAR FROM f."createdAt"))
    EXTRACT(YEAR FROM f."createdAt") AS year,
    f."flightDistance" AS max_distance,
    u."firstName" || ' ' || u."lastName" AS pilot_name,
    'XC-' || f."externalId" AS flight_id
  FROM "Flights" f
  JOIN "Users" u ON f."userId" = u.id
  WHERE f."flightDistance" IS NOT NULL
  ORDER BY EXTRACT(YEAR FROM f."createdAt"), f."flightDistance" DESC
)
SELECT * FROM max_flights
ORDER BY year DESC;

-- Anzahl Teams pro Jahr (basierend auf season)
SELECT 
  season AS year,
  COUNT(*) AS team_count
FROM "Teams"
WHERE season IS NOT NULL
GROUP BY season
ORDER BY season DESC;