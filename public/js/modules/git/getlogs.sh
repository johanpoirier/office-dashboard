cd $1
if [ ! -d $2 ]; then
    mkdir $2
fi
cd $2

if [ ! -d .git ]; then
    git init
fi

if [ ! $4 = "" ]; then
    git config http.proxy $4
fi

git remote add origin %3
git fetch --depth=$6 -n
git log --pretty=format:"%%an;%%s" --no-merges $5 > logs

cd $1