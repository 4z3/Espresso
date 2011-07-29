#! /bin/sh
#
# usage: run.sh <files-and-directories...>
#
set -euf

#
# init - build install spritemapper first, if necessary and setup environment
#
pwd="`dirname "$0"`"

srcdir="$pwd/github/yostudios/Spritemapper"
prefix="$pwd/.Espresso"

bindir="$prefix/usr/bin"
libdir="$prefix/usr/lib"

exe="$bindir/spritemapper"

if ! test -e "$exe"; then
  (cd "$srcdir" && python setup.py install --root "$prefix")
fi
if head -n 1 "$exe" | grep '^#!\.$'; then
  echo "Error: \`python setup.py install --root \"$prefix\"' failed to produce a correct executable \"$exe\".  This is a known bug and we don't know who is made of stupid... but we'll fix now so you don't have to worry...^_^" >&2
  sed -i -r '1s:.*:#! /usr/bin/env python:' "$exe"
fi

# XXX we assume there's only one python* directory... else we will die...
SM_PYTHON_PATH="`find "$libdir" -name 'python*' -d -mindepth 1 -maxdepth 1
                `/site-packages"

export PYTHONPATH="$SM_PYTHON_PATH${PYTHONPATH+:$PYTHONPATH}"
export PATH="$bindir:$PATH"

css_sentinel='/* This file was touched by Espresso and Spritemapper */'

#
# main
#
for arg; do
  if test -f "$arg"; then
    if ! head -n 1 "$arg" | fgrep -q "$css_sentinel"; then
      #
      # process a single file
      #
      OLDPWD="$PWD"
      cd "`dirname "$arg"`"

      css="`basename "$arg"`"

      output_css="Espresso.spritemapper.output_css.$css"
      log="Espresso.spritemapper.log.$css"
      conf="Espresso.spritemapper.conf.$css"
      spritemaps="Espresso.spritemapper.spritemaps.$css"
      newcss="Espresso.spritemapper.newstyle.$css"
      allimages="Espresso.spritemapper.allimages.$css"
      allnewcssimages="Espresso.spritemapper.allnewcssimages.$css"
      bundledimages="Espresso.spritemapper.bundledimages.$css"
      unbundledimages="Espresso.spritemapper.unbundledimages.$css"
      bundlecss="Espresso.spritemapper.bundlecss.$css"
      output_bundlecss="Espresso.spritemapper.output_bundlecss.$css"
      cleanup() {
        rm -f "$output_css"
        rm -f "$log"
        rm -f "$conf"
        rm -f "$spritemaps"
        rm -f "$newcss"
        rm -f "$allimages"
        rm -f "$allnewcssimages"
        rm -f "$bundledimages"
        rm -f "$unbundledimages"
        rm -f "$bundlecss"
        rm -f "$output_bundlecss"
      }
      trap cleanup EXIT

      # extract all url() enclosed URLs from stdin to stdout
      allcssurls() {
        sed 's/url(['\''"]\?\([^)'\''"]*\)['\''"]\?/\nURL:\1\n/g' |
        sed -n 's/^URL://p' | sort | uniq
      }

      allcssurls < "$css" > "$allimages"

      #
      # (A)
      #

      cat>"$conf"<<EOF
[spritemapper]
anneal_steps = 0
output_css = $output_css
EOF
      spritemapper -c "$conf" "$css" 2>&1 | tee "$log" |
          sed -n '/Traceback/!{p;b};:q;n;bq'

      if ! grep -q 'Traceback' "$log"; then
        sed -rn 's/^writing spritemap image at (.*)/\1/p' "$log" > "$spritemaps"
        sed -rn 's/^writing new css at (.*)/\1/p' "$log" > "$newcss"

        #
        # (B)
        #

        while read f; do
          allcssurls < "$f"
        done < "$newcss" > "$allnewcssimages"
        
        # find all images that were bundled into spritemaps
        # i.e. all images that were in cass but ain't in newcss
        diff "$allimages" "$allnewcssimages" |
        sed -n 's/^< //p' > "$bundledimages"

        # find all images that were not bundled into spritemaps
        set -- "$allimages" "$allnewcssimages"
        diff -U "`wc -l "$@" | tail -n 1 | awk '{print$1}'`" "$@" |
        sed -n 's/^ //p' > "$unbundledimages"

        # remove unbundled images from original css
        sed "`
          cat "$unbundledimages" |
          sed 's:/:\\\\\\\\/:g' |
          while read url; do
            echo "s/$url/-/g"
          done
        `" "$css" > "$bundlecss"

        #
        # (C)
        #

        cat>"$conf"<<EOF
[spritemapper]
output_css = $output_bundlecss
EOF
        spritemapper -c "$conf" "$bundlecss" |
            sed '/^ERROR:spritecss.main:-: not readable$/d'

        #
        # (D)
        #

        # replace original css with new css
        {
          echo "$css_sentinel"
          while read f; do
            cat "$f"
          done < "$newcss"
        } > "$css"

        # remove bundled images
        sed 's/^/rm /' "$bundledimages" | sh

        color=32
      else
        color=31
      fi

      cleanup
      trap - EXIT
      cd "$OLDPWD"
    else
      color=33
    fi

    echo "[$color;1m$arg[m" >&2
  elif test -d "$arg"; then
    #
    # process all the css within a folder
    #
    find "$arg" -type f -name '*.css' | xargs "$0"
  else
    echo 'Error 1: You are made of stupid!' >&2
    exit 23
  fi
done
