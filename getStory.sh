#!/bin/bash

appPath=$( cd `dirname ${BASH_SOURCE[0]}` && pwd)
panic(){ echo "$@"; exit 1; }
usage(){
    [[ -z "$@" ]] || echo -e "\n$@\n" 
    cat << EOF
An inklewriter story downloader
$0 ID
  - ID : an inklewriter story, ex: 9crb
EOF
    exit 1
}
[[ -z "$1" ]] && usage "Please provide an inklewriter story id!"
[[ 4 -ne ${#1} ]] && usage "Please provide a valid id!"
destFile="${appPath}/stories/${1}.json"
if [[ -f $destFile ]] ; then 
    read -p "Destination file exists. Delete it? [Yn]: "
    REPLY=${REPLY:-Y}
    if [[ "N" == "${REPLY^^}" ]] ; then 
       panic "Aborting."
    else
       rm -f $destFile
    fi
fi

R=$(curl -s "https://writer.inklestudios.com/stories/${1}.json" 2>&1 > "$destFile")

[[ 0 -ne $? ]] && panic "Failed to download file : $R"

echo "OK, done."

