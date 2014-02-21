@ECHO OFF
set TERM=msys
CD %1
IF NOT EXIST %2 mkdir %2
CD %2
IF NOT EXIST .git git init
IF NOT %4=="" git config http.proxy %4
git remote add origin %3
git fetch --depth=5 -n
git log --pretty=format:"%%an;%%s" --all > logs
CD %1