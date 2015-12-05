#babel inject.es6 --watch --out-file inject.js

inject.js: lib/*.js inject.es6
  cat lib/*.js inject.es6 > inject.js