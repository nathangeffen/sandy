#!/bin/bash -x

flock -x sakev.lock npx http-server . -p 9999 &

inotifywait -e close_write,moved_to,create -m . |
while read events; do
        fuser -kill sakev.lock
        cd src; tsc --target es2018 variation.ts game.ts gameux.ts
        cd ..
        flock -x sakev.lock npx http-server . -p 9999 &
done
