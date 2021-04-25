#!/bin/bash
USER_NAME=postgres3
USER_PASSWORD=postgres
USER_HOME=/home/$USER_NAME

useradd -p $USER_PASSWORD -m $USER_NAME

chmod 770 $USER_HOME
mkdir $USER_HOME/data