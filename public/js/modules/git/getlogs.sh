#!/bin/sh

cd $1
if [ ! -d $2 ]; then
    mkdir $2
fi
cd $2

if [ ! -d .git ]; then
    git init
    git remote add origin $3
    if [ ! $4 = "" ]; then
        git config http.proxy $4
    fi
    git fetch --depth=$6 -n
else
    if [ ! $4 = "" ]; then
        git config http.proxy $4
    fi
    git fetch
fi

git log --pretty=format:"%an;%s;%ar" --no-merges origin/$5 > logs

cd $1