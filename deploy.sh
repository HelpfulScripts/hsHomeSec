#!/bin/bash

destHomeSec=hauke@doggie.local:/Users/hauke/Docs/homeSec/
# destHomeSec=/Downloads/homeSec

scp node_modules/hsnode/* $destHomeSec/node_modules/hsnode
scp node_modules/hsutil/* $destHomeSec/node_modules/hsutil
scp src/config/* $destHomeSec/config/

scp _dist/bin/package.json $destHomeSec
scp _dist/bin/index.js $destHomeSec
scp -r _dist/bin/node $destHomeSec
scp -r _dist/bin/shellscript/* $destHomeSec/scripts

scp -r src/osascript/*    $destHomeSec/scripts
# scp -r src/shellscript/  $destHomeSec/scripts
