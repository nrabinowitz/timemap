# makedistro.py
# build script for packing the TimeMap library with the YUI Compressor

import sys, os
import shutil, glob

# path to yui compressor
if len(sys.argv) > 1:
    yuic = sys.argv[1]
else:
    yuic = r'"C:\Program Files\yuicompressor\build\yuicompressor.jar"'

# pack and copy core lib
os.system("java -jar %s timemap.js > timemap.pack.js" % yuic)
print "Packed timemap.js"
shutil.copy("timemap.pack.js", "timemap_full.pack.js")

# make list of files to pack
ignore = ['timemap.js', 'timemap.pack.js', 'timemap_full.pack.js']
files = [f for f in glob.glob('*.js') if not f in ignore]
# prepend libraries
files = [os.path.join('lib', 'json2.pack.js')] + files
# append loaders
files += [f for f in glob.glob(os.path.join('loaders','*.js'))]

for f in files:
    os.system("java -jar %s %s >> timemap_full.pack.js" % (yuic, f))
    print "Packed and added %s" % f
