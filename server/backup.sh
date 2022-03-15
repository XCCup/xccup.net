#!/bin/bash
DB_PASSWORD=
DB_USERNAME=
DB_NAME=
PROJECT_FOLDER=

set -e #Exit if any command failed with != 0

# Create SQL Dump
filename=postgres_$(date +'%A')

docker exec -i xccup-db /bin/bash -c "PGPASSWORD=$DB_PASSWORD pg_dump --username $DB_USERNAME $DB_NAME" | gzip > $PROJECT_FOLDER/backups/$filename.sql.gz
echo "Dump OK"

cd $PROJECT_FOLDER/
tar -zcvf backups/xccup-data-backup.tar.gz data/


echo  "All done"

# Restore (It seems that you have to drop the db before and create a new one because of conflicts)
# Drop all schemas (public, tiger, s.o.)
# docker exec -i db /bin/bash -c "PGPASSWORD=xccup_pw psql --username xccup_user xccup_db -c 'drop schema public,tiger,tiger_data,topology cascade'"
# Create schema public
# docker exec -i db /bin/bash -c "PGPASSWORD=xccup_pw psql --username xccup_user xccup_db -c 'create schema public'"
# Load backup dump
# docker exec -i db /bin/bash -c "PGPASSWORD=xccup_pw psql --username xccup_user xccup_db" < Path to SQL dump on docker host
