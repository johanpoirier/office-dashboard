#!/bin/sh
PATH="$PATH:/opt/node/bin"
cd /home/pi/office-dashboard
grunt prod -proxy 1> stdout.log 2> stderr.log &
