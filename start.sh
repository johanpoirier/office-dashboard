#!/bin/sh
cd /home/pi/office-dashboard
/opt/node/bin/npm start 1> stdout.log 2> stderr.log &
