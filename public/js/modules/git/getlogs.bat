
set TERM=msys

CD %1
IF NOT EXIST %2 mkdir %2
CD %2

IF NOT EXIST .git (
    git init
    git remote add origin %3
    IF NOT %4=="" git config --local http.proxy %4
    IF %4=="" git config --local --unset http.proxy
    git fetch --depth=%6 -n
) ELSE (
    IF NOT %4=="" git config --local http.proxy %4
    IF %4=="" git config --local --unset http.proxy
    git fetch
)
git log --pretty=format:"%%an;%%s;%%ar" --no-merges origin/%5 > logs

CD %1