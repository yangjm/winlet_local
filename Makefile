.PHONY: install lint lint-fix build dev clean dist-clean publish check test help

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

test: ## Run tests (placeholder)
	@echo "No tests yet"

clean: ## Remove dist/ and node_modules/
	rm -rf dist/ node_modules/

dist-clean: ## Remove dist/ only
	rm -rf dist/

publish: build ## Build then npm publish
	npm publish

check: lint build ## Lint + build (pre-publish check)

.DEFAULT_GOAL := help
