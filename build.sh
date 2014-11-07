#!/bin/bash
echo Deleting old dist
rm -R dist

echo Merge css files into dist/squebi.css
node r.js -o optimizeCss=standard.keepLines.keepWhitespace cssIn=squebi/css/main.css out=squebi.css

echo Merge and uglify javascript files into squebi.js
node r.js -o baseUrl=. mainConfigFile=main.js name=main out=squebi.js optimize=none

#echo Move to dist
mkdir dist
mv squebi.js dist/squebi.js
mv squebi.css dist/squebi.css
