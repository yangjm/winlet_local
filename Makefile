.PHONY: install lint lint-fix build dev clean dist-clean publish check test link unlink help

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

lint: ## Run ESLint on src/
	npx eslint src/

lint-fix: ## Run ESLint with --fix
	npx eslint src/ --fix

build: ## Production build (rollup)
	npx rollup -c

dev: ## Watch mode (rollup)
	npx rollup -c --watch

test: ## Run tests
	npx vitest run

clean: ## Remove dist/ and node_modules/
	rm -rf dist/ node_modules/

dist-clean: ## Remove dist/ only
	rm -rf dist/

link: build ## Build and register global npm link
	npm link
	@echo ""
	@echo "Global link created."
	@echo ""
	@echo "After changing code in this project, rebuild to update dist/:"
	@echo "  make build       (one-time)"
	@echo "  make dev         (watch mode)"
	@echo ""
	@echo "In another project:"
	@echo "  npm link winlet-local"
	@echo ""
	@echo "To stop using the link in that project:"
	@echo "  npm unlink winlet-local && npm install"
	@echo ""
	@echo "To remove this global link:"
	@echo "  make unlink"

unlink: ## Remove global npm link
	npm unlink

publish: check ## Lint + test + build then npm publish
	npm publish

check: lint test build ## Lint + test + build (pre-publish check)

.DEFAULT_GOAL := help
