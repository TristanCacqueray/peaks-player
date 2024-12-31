.PHONY: dev
dev:
	npx vite --host 0.0.0.0 src

.PHONY: release
release:
# remove optional dependencies to reduce bundle size
	npx vite build --minify --sourcemap
