SHELL := /bin/bash

APP_REGISTRY ?= ghcr.io
APP_IMAGE_NAME ?= semrush/purr
APP_IMAGE_VERSION ?= latest

PURR_PARAM_USER_EMAIL ?= example@example.com
PURR_PARAM_USER_PASSWORD ?= secret
PURR_CONFIG_REDIS_HOST ?= redis-master
PURR_CONFIG_REDIS_PASSWORD ?= ''
PURR_CONFIG_SENTRY_DSN ?= ''


.EXPORT_ALL_VARIABLES:
.ONESHELL:


docker-build-app:
	docker compose  \
		-f docker-compose.single.yml \
		build

docker-build-app-no-cache:
	docker compose build \
		--no-cache \
		-f docker-compose.single.yml
lint:
	docker compose run  \
		-f docker-compose.single.yml
		purr yarn run lint

test:
	docker compose run --rm \
		-f docker-compose.single.yml
		purr yarn run test

start: docker-build-app
	docker compose \
		-f ./docker-compose.yml \
		up

down-dev:
	docker compose \
		-f ./docker-compose.yml \
		-f ./docker-compose.single.yml \
		down

start-dev: docker-build-app
	mkdir -p ./storage
	chown 1000:1000 ./storage
	docker compose \
		-f ./docker-compose.yml \
		-f ./docker-compose.single.yml \
		up

attach-dev:
	docker compose \
		-f ./docker-compose.yml \
		-f ./docker-compose.single.yml \
		exec purr bash

update-readme-toc:
	yarn doctoc --notitle --maxlevel 2 --github README.md

check:
ifeq (, $(name))
$(error "Check name is required")
endif
	docker compose \
		-f ./docker-compose.single.yml \
		run purr /app/src/cli.js check $(name)
