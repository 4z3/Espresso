#! /bin/sh
#
# usage: run.sh <build-dirctory>
#
set -euf
cd "$1"

deserver() {
  "$Node_exe" "$Espresso_dir/node_modules/deserver"
}

typeof() {
  # TODO use file; ensure that file works everywhere...lol
  echo "$1" | sed '
    s:^.*\.css$:text/css:
    s:^.*\.gif$:image/gif:
    s:^.*\.html$:text/html:
    s:^.*\.jpg$:image/jpeg:
    s:^.*\.js$:application/javascript:
    s:^.*\.json$:application/json:
    s:^.*\.manifest$:text/cache-manifest:
    s:^.*\.png$:image/png:
    s:^.*\.svg$:image/svg+xml:
  '
}

publish() {
  type="`typeof "$1"`"
  url="http://localhost:$port/$app_name/$1"
  curl -sS -X PUT -H "content-type: $type" --data-binary @- "$url" < "$1"
  echo "publish $url [$type]" >&2
}

port=1337

deserver &
atexit="${atexit+$atexit;}kill -0 $! && kill $!"
trap "$atexit" EXIT INT
while ! curl -s -X HEAD "http://localhost:$port"; do
  sleep 0.05
done

find . -type f | sed 's:^\./::' |
while read pathname; do
  publish "$pathname" &
done

wait
