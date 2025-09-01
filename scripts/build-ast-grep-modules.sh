#!/usr/bin/env bash

set -e

outdir="$PWD/lib"
builddir="$(mktemp -d)"

cleanup() {
  rm -rf "$builddir"
}

trap cleanup EXIT
mkdir -p $outdir

# Check if we're on Alpine/musl by looking for musl in ldd output
if command -v tree-sitter >/dev/null 2>&1; then
  # Use globally installed tree-sitter-cli if available
  tree_sitter_command=(tree-sitter)
else
  # Fall back to npx
  tree_sitter_command=(npx tree-sitter-cli)
fi

cd $builddir

git clone https://github.com/tree-sitter-grammars/tree-sitter-vue
cd tree-sitter-vue
"${tree_sitter_command[@]}" build
cp *.so $outdir/ 2>/dev/null || cp *.dylib $outdir/ 2>/dev/null || cp *.dll $outdir/ 2>/dev/null || echo "No shared library found for vue"
cd ..
rm -rf tree-sitter-vue

git clone https://github.com/serenadeai/tree-sitter-scss
cd tree-sitter-scss
"${tree_sitter_command[@]}" build
cp *.so $outdir/ 2>/dev/null || cp *.dylib $outdir/ 2>/dev/null || cp *.dll $outdir/ 2>/dev/null || echo "No shared library found for scss"
cd ..
rm -rf tree-sitter-scss
