#! /bin/sh
#
# usage: run.sh <build-dirctory>
#
set -euf
cd "$1"

make_filter() {
  # generate a sed script that filters out every line in $1 from stdin
  echo "$1" | sed -r '
    s:/|\.|\[|\]|\*|\\:\\&:g
    s:.*:/&/d:;#blah
    # s:.*:s/&/# \&/:;# only comment out every line
  '
}

filter() {
  sed "`make_filter "$1"`"
}

cache="`find . -type f | sed 's:^\./::' | filter "$excludes" | sort`"

cat > cache.manifest <<EOF
CACHE MANIFEST
# Application: $name, Version: $version, Timestamp: $timestamp

CACHE:
$cache

NETWORK:
*

FALLBACK:
$fallbacks
EOF
