:: makedistro.bat
:: build script for packing the TimeMap library with the YUI Compressor

:: path to YUI Compressor
set yuic="C:\Program Files\yuicompressor\build\yuicompressor.jar"

java -jar %yuic% timemap.js > timemap.pack.js
copy timemap.pack.js timemap_full.pack.js
for %%X in (*.js) do (
    if "%%X" == "timemap.js" goto LOOP
    if "%%X" == "timemap.pack.js" goto LOOP
    if "%%X" == "timemap_full.pack.js" goto LOOP
    java -jar %yuic% %%X >> timemap_full.pack.js
    :LOOP
    echo "processed"
    )
:: add JSON library
java -jar %yuic% json2.pack.js >> timemap_full.pack.js