# xccup.net backend

## Project setup

Delete the node_modules folder

```
docker-compose run --rm yarn install
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

## Before first StartUp

#### Define ENV Vars

You need to create a .env File in the root folder. There is a .env-sample which you can copy and rename for this purpose. To create proper JWT Tokens you can run `./helper/create-jwt-token.js` and copy the output into your .env-File.

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
docker-compose run --rm yarn test
```

##### A single tests

```
docker-compose run --rm yarn test test/LocationFinder.test.js
```

#### Connect PgAdmin to Postgres:

- Lookup credentials in .env
- Add New Server -> Connection -> Hostname: <<name_of_ab_container>> Port: 5432
- Tables can be via: Databases -> xccup_db -> Schemas -> public -> Tables

#### Set column width in PgAdmin

File -> Preferences -> Query Tool -> Results grid -> "Do as you like"

#### Compile the OLC Binary

```
gcc olc2002.c -o olc_lnx -lm
```
