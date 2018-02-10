#!/bin/bash 
panic() { echo "$@"; exit 2; }
APP_PATH=$(cd `dirname ${BASH_SOURCE[0]}` && pwd )
cd $APP_PATH
which node &>/dev/null || packageList+=( nodejs )
which php &>/dev/null || packageList+=( php-cli )
[ 0 -ne ${#packageList[@]} ] && sudo aptitude install ${packageList[@]}
npm install

