#!/bin/sh

# uninstall the current bcrypt modules
# npm uninstall bcrypt

# install the bcrypt modules for the machine
# This is needed because bcrypt uses different modules for different architectures.
# If the node_modules folder is shared the process will crash otherwise.
# https://medium.com/hacktive-devs/the-bcrypt-bg-on-docker-9bc36cc7f684

# npm install bcrypt

# The reinstall of bcrypt has become for the time being obsolet due to the fact that the dependency was replaced by bcryptjs
# TODO Evaluate if the usage of bcryptjs is sufficent enough

echo "Waiting for DB to start..."
./wait-for db:5432 

echo "Starting the API server..."
if [ $NODE_ENV == "production" ]
then
    # https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#cmd
    node app.js 
else
    npm run dev
fi
