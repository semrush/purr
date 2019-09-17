SHELL := /bin/bash

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
	docker build . \
		-f docker/Dockerfile \
		-t ${APP_IMAGE_NAME}:${APP_IMAGE_VERSION}

docker-build-app-no-cache:
	docker build . \
		--no-cache \
		-f docker/Dockerfile \
		-t ${APP_IMAGE_NAME}:${APP_IMAGE_VERSION}

lint:
	docker run --rm -it \
		-v ${PWD}:/app \
		${APP_IMAGE_NAME}:${APP_IMAGE_VERSION} npm run lint

test:
	docker run --rm -it \
		-v ${PWD}:/app \
		${APP_IMAGE_NAME}:${APP_IMAGE_VERSION} npm run test

start: docker-build-app
	docker-compose \
		-f ./docker-compose.yml \
		up

down-dev:
	docker-compose \
		-f ./docker-compose.yml \
		-f ./docker-compose.dev.yml \
		down

start-dev: docker-build-app
	docker-compose \
		-f ./docker-compose.yml \
		-f ./docker-compose.dev.yml \
		up

attach-dev:
	docker-compose \
		-f ./docker-compose.yml \
		-f ./docker-compose.dev.yml \
		exec cli bash
