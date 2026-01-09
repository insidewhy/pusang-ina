# pusang-ina

`pusang-ina` provides configuration files for [ast-grep](https://github.com/ast-grep/ast-grep) to allow it to understand vue projects (including support for scss).

`ast-grep`'s use of [tree-sitter](https://github.com/tree-sitter/tree-sitter) requires building binaries to support syntaxes that are not built in to the default `ast-grep` package.
Github actions are used to build binaries for each release for the following architectures:

- `Linux x86 with glibc`
- `Linux x86 with musl`
- `MacOS arm64`
- `MacOS x64`
- `Windows x86`

Please feel free to open a PR to add more architectures to the build system.

[This blog post](https://dev.to/insidewhy/using-ast-grep-with-a-vue-project-2np2) explains how this configuration works.

## Installation

```bash
pnpm add -D pusang-ina
ln -sf node_modules/pusang-ina/sgconfig.yml .
```
