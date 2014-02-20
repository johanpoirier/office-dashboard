g:
cd /Temp
IF NOT EXIST gitest mkdir gitest
cd gitest
IF NOT EXIST .git git init
git remote add origin https://github.com/johanpoirier/office-dashboard.git
git fetch --depth=2 -n
git log origin/master