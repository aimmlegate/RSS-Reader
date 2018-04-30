install:
	npm install

lint:
	npm run eslint .

publish:
	npm publish

develop:
	npm run webpack-serve

build:
	rm -rf dist
	NODE_ENV=production npm run webpack