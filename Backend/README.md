# xccup.net backend

## Project setup

```
npm install --arch=x64 --platform=linuxmusl
```

### Why to set arch/platform parameters (Sharp dependency)

Sharp is a high performance dependency for image compression which uses kernel functions.
The sharp dependency comes with precompiled binaries for different platforms and architectures.
During the build process of the docker image the sharp dependency will be installed according to the alpine linux version (platform=linuxmusl).
This platform can differ from the project environment platform. It's important that sharp will be installed to the project with the same binaries as in the docker container.

See also:
https://sharp.pixelplumbing.com/install

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

- [ ] Glider im Profil löschen/hinzufügen
