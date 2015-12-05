LIBS := $(wildcard lib/*.js)

SOURCE_JS := inject.es6
BUILD_JS := dist/inject.min.js

SOURCE_CSS := inject.css
BUILD_CSS := dist/inject.min.css

UGLIFYJS := ./node_modules/uglify-js/bin/uglifyjs
BABEL 	 := ./node_modules/babel-cli/bin/babel.js

all: $(BUILD_JS) $(BUILD_CSS)

/tmp/inject.js: $(SOURCE_JS)
	$(BABEL) $? --source-maps inline --out-file $@

$(BUILD_JS): $(LIBS) /tmp/inject.js
	$(UGLIFYJS) --compress --mangle -- $^ > $(BUILD_JS)

$(BUILD_CSS): $(SOURCE_CSS)
	minify inject.css > dist/inject.min.css