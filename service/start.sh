#!/bin/sh
PATH="$PATH:/opt/node/bin"
cd /home/pi/office-dashboard
grunt 1> stdout.log 2> stderr.log &
