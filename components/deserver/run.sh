#! /bin/sh
#
# usage: run.sh <build-dirctory>
#
set -euf
#cd "$1"

# TODO make port and host configurable
host=${host-127.0.0.1}
port=${port-1337}

url_prefix=/${app_name+$app_name/}
Node_exe=${Node_exe-node}
Espresso_dir=${Espresso_dir-$(readlink -f $(dirname $(readlink -f $0))/../..)}
deserver_script=${deserver_script-$Espresso_dir/node_modules/deserver}
app_json="${app_json-$1/app.json}"
config_json="${config_json-config.json}"

deserver() {
  "$Node_exe" "$deserver_script" "$app_json"
}
start_deserver() {
  deserver | analyze_output &
  deserver_pid=$!
  atexit="${atexit+$atexit;}stop_deserver"
  trap "$atexit" EXIT INT
  while ! curl -s -X HEAD "http://$host:$port"; do
    if deserver_is_running; then
      sleep 0.05
    else
      exit 1
    fi
  done
}
stop_deserver() {
  ! deserver_is_running || kill $deserver_pid
}
deserver_is_running() {
  kill -0 $deserver_pid 2>/dev/null
}

# TODO GET/200 + url = /  ->  rebuild
analyze_output() {
  while read method url statusCode pid; do
    case $method/$statusCode in
      (GET/SIGSTOP)
        build_log="$output_dir/build.log"
        # TODO we should provide all relevant command line arguments
        "$Espresso_exe" build --config $config_json | tee $build_log
        build_dir=`sed -rn 's/^manifest end (.*)$/\1/p' $build_log`
        $deserver_script/tools/app.json/make-app $build_dir > $app_json
        echo TODO build $app_json
        echo  build_dir $build_dir
        kill -s CONT $pid
      ;;
      (PUT/201)
        echo "publish http://$host:$port$url";;
      (*)
        echo "$method $url $statusCode $pid";;
    esac
  done
}

start_deserver

echo PWD: $PWD
echo deserver_pid: $deserver_pid
wait
