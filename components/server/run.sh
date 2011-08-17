#! /bin/sh
#
# usage: run.sh <build-dirctory>
#
set -euf
cd "$1"

# TODO make port and host configurable
port=1337

url_prefix=/${app_name+$app_name/}
Node_exe=${Node_exe-node}
Espresso_dir=${Espresso_dir-$(readlink -f $(dirname $(readlink -f $0))/../..)}
deserver_script=${deserver_script-$Espresso_dir/node_modules/deserver}

deserver() {
  "$Node_exe" "$deserver_script"
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
  url="http://localhost:$port$url_prefix$1"
  curl -sS -X PUT -H "content-type: $type" --data-binary @- "$url" < "$1"
  echo "publish $url [$type]" >&2
}

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
