#!/bin/sh
cd /home/pi/office-dashboard
NODE_ENV=production /opt/node/bin/npm start 1> stdout.log 2> stderr.log &
