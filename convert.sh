# Convert svg to webp (via png) with size 1024x512 (2:1 aspect ratio), adds padding (i.e. does not crop)
#
# Requires svgexport and cwebp:
# npm install svgexport -g
# brew install cwebp
#
# Original svg should include border (10px)
# Default bg color is dark
#
# Usage: ../../../convert.sh filename-without-extension [light|dark|black]

declare -A BG
BG["light"]="rgb(250, 250, 250)"
BG["dark"]="rgb(42, 42, 42)"
BG["black"]="rgb(24, 24, 24)"
BG_KEY="${2:-dark}"

svgexport ${1}.svg ${1}.png 100% pad 1024:512 "body{background:${BG[$BG_KEY]};}"
cwebp -q 90 ${1}.png -o ${1}.webp
