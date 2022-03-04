#!/bin/bash
DB_PASSWORD=
DB_USERNAME=
DB_NAME=

set -e #Exit if any command failed with != 0

# Create SQL Dump 
docker exec -i xccup-db /bin/bash -c "PGPASSWORD=$DB_PASSWORD pg_dump --username $DB_USERNAME $DB_NAME" > /home/xccup/xccup.net/data/backup/postgres-backup.sql
echo "Dump OK"

cd /home/xccup/xccup.net/
tar -zcvf xccup-backup.tar.gz data/backup data/images/ data/igc/$(date +"%Y")



# Restore (It seems that you have to drop the db before and create a new one because of conflicts)
# docker exec -i db /bin/bash -c "PGPASSWORD=$DB_PASSWORD psql --username $DB_USERNAME $DB_NAME" < Path to SQL dump on docker host
