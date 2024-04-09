# xccup.net backend

## Project setup

Delete the node_modules folder

```
docker-compose run --rm npm install
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

## After setup

#### Config backup

Define credentials in backup.sh and config a cron job to execute backup.sh on a daily basis.

## HowTo

#### Run tests

##### All tests

```
docker-compose run --rm npm run test
```

##### A single tests

```
docker-compose run --rm npm run test test/LocationFinder.test.js
```

#### Connect PgAdmin to Postgres:

- Lookup credentials in .env
- Add New Server -> Connection -> Hostname: <<name_of_ab_container>> Port: 5432
- Tables can be via: Databases -> xccup_db -> Schemas -> public -> Tables

#### Set column width in PgAdmin

File -> Preferences -> Query Tool -> Results grid -> "Do as you like"

#### Compile the OLC Binary

Contrary to what the name indicates we are using `olc2002.c` and not `olc2002_xccup.c`

```
gcc olc2002.c -o olc_lnx -lm
```
