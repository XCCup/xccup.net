#!/bin/sh

echo "Waiting for DB to start..."
./wait-for db:5432 #TODO: Maybe better wait in the app where the DB is needed

echo "Starting the API server..."
# "exec" is here to replace the current bash script's process with the node's process.
# Otherwise interupts like SIGINT might not make it through to the node process.
if [ $NODE_ENV == "development" ]; then
    exec yarn dev
else
    exec yarn start
fi
