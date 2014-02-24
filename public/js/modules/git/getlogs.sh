cd $1
if [ ! -d $2 ]; then
    mkdir $2
fi
cd $2

if [ ! $4 = "" ]; then
    git config http.proxy $4
fi

if [ ! -d .git ]; then
    git init
    git remote add origin $3
    git fetch --depth=$6 -n
else
    git fetch
fi

git log --pretty=format:"%an;%s;%ar" --no-merges $5 > logs

cd $1