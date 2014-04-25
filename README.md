office-dashboard
================

To test the application : 
-------------------------
1. install Chrome Canary or Chromium (35.0 minimum)
2. enable experimental web platform features : http://html.adobe.com/webplatform/enable/
3. npm install
4. grunt
5. open http://localhost:8085 for client view and http://localhost:8085/admin for admin view

To debug backend application : 
------------------------------
1. npm install -g node-inspector
2. grunt debug
3. go to http://localhost:8088/debug?port=5857 with Chrome

To use http proxy : 
-------------------
1. add proxy_host and proxy_conf constants to global config
2. launch grunt with -proxy option

To run tests : 
-------------------
1. grunt test (with -proxy option if needed)


[![Build Status](https://travis-ci.org/johanpoirier/office-dashboard.png?branch=master)](https://travis-ci.org/johanpoirier/office-dashboard.png?branch=master)
