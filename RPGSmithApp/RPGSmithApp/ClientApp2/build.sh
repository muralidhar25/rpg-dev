#!/usr/bin/env bash

gzip -9 ./dist/*.js

gzip -9 ./dist/*.css

cd dist

for file in *.gz; do mv "$file" "$(basename "$file" .gz)"; done;
