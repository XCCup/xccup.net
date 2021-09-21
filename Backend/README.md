# xccup.net backend

## StartUp

#### Dev Server:

`docker-compose up`

#### Live Dev Server:

`docker-compose -f docker-compose-live-dev.yml up -d`

## After first StartUp

#### Config DB

After the first start up of the DB, it's necessary to activate the PostGIS plugin and set the correct timezone
`docker exec -it db psql -U xccup_user xccup_db -c "create extension postgis;" -c "set timezone='Europe/Berlin'"`

## HowTo

#### Connect PgAdmin to Postgres:

- Lookup credentials in .env
- Add New Server -> Connection -> Hostname: <<name_of_ab_container>> Port: 5432

#### Complie the OLC Binary

`gcc olc2002.c -o olc_lnx -lm`

## Todo

- [ ] Punkteauswertung erst nach commit des Glider starten, bzw. neu Berechnung bei Änderung durchführen
- [ ] IgcAnalyzer mit Unit-Test versehen
- [ ] Endpoint Hersteller erstellen
- [ ] Glider im Profil löschen/hinzufügen
