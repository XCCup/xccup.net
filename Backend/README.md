# xccup.net backend

## Project setup

```
npm install
```

## StartUp

#### Dev Server:

```
docker-compose up
```

#### Live Dev Server:

```
docker-compose -f docker-compose-live-dev.yml up -d
```

## After first StartUp

#### Config DB

After the first start up of the DB, it's necessary to activate the PostGIS plugin and set the correct timezone
```
docker exec -it db psql -U xccup_user xccup_db -c "create extension postgis;" -c "set timezone='Europe/Berlin'"
```

## HowTo

#### Run tests

##### All tests

```
npm run test
```

##### A single tests

```
npm test -- test/LocationFinder.test.js
```

#### Connect PgAdmin to Postgres:

- Lookup credentials in .env
- Add New Server -> Connection -> Hostname: <<name_of_ab_container>> Port: 5432
- Tables can be via: Databases -> xccup_db -> Schemas -> public -> Tables

#### Complie the OLC Binary

```
gcc olc2002.c -o olc_lnx -lm
```

## Todo

- [ ] Endpoint Hersteller erstellen
- [ ] Glider im Profil löschen/hinzufügen
