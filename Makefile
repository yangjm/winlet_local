.PHONY: install lint lint-fix build dev clean dist-clean publish check test deploy help

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

DEMO_DIR ?= ../winlet_demo
DEMO_TARGETS = $(DEMO_DIR)/demo_1/src/main/webapp/resources/winlet_local \
               $(DEMO_DIR)/demo_2/src/main/webapp/resources/winlet_local

deploy-demo: build ## Build and copy dist/ to demo projects
	@for t in $(DEMO_TARGETS); do \
		mkdir -p "$$t" && cp dist/* "$$t"/ && echo "Deployed to $$t"; \
	done

publish: check ## Lint + test + build then npm publish
	npm publish

check: lint test build ## Lint + test + build (pre-publish check)

.DEFAULT_GOAL := help
