.PHONY: dev
dev:
	npx vite --host 0.0.0.0 src

.PHONY: release
release:
	npx vite build --minify --sourcemap
