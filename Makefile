override APPLICATION_NAME=purr
override NODE_VERSION=20.5

DOCKER_IMAGE?=ghcr.io/semrush/purr
DOCKER_TAG?=latest
CHECK_NAME:=example-com
SUITE_NAME:=example-com-suite

.PHONY: yarn-install
yarn-install:
	rm -r ${CURDIR}/node_modules || true
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
		--entrypoint yarn \
			node:${NODE_VERSION} \
				install --frozen-lockfile

.PHONY: yarn-lint
yarn-lint:
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
		--entrypoint yarn \
			node:${NODE_VERSION} \
				run lint

.PHONY: lint
lint: yarn-lint

.PHONY: yarn-test
yarn-test:
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
		-e PUPPETEER_SKIP_DOWNLOAD=true \
		--entrypoint yarn \
			node:${NODE_VERSION} \
				run test --bail

.PHONY: test
test: yarn-test

.PHONY: docker-build
docker-build:
	docker rmi --force ${DOCKER_IMAGE}:${DOCKER_TAG} || true
	docker buildx create --use
	docker buildx inspect --bootstrap
	docker buildx build \
		--force-rm \
		--file ${CURDIR}/docker/Dockerfile \
		--platform linux/amd64,linux/arm64 \
		--tag ${DOCKER_IMAGE}:${DOCKER_TAG} \
		.

.PHONY: build
build: docker-build

.PHONY: docker-compose-up
docker-compose-up:
	DOCKER_IMAGE=${DOCKER_IMAGE} DOCKER_TAG=${DOCKER_TAG} docker compose -p ${APPLICATION_NAME} up -d

.PHONY: docker-compose-down
docker-compose-down:
	docker compose -p ${APPLICATION_NAME} down --remove-orphans --volumes --rmi local

.PHONY: run-check
run-check: docker-build
	rm -r ${CURDIR}/storage/* || true
	docker run --rm \
		-v ${CURDIR}:/app \
		--env-file ${CURDIR}/.env \
			${DOCKER_IMAGE}:${DOCKER_TAG} \
				check $(CHECK_NAME)

.PHONY: run-suite
run-suite: docker-build
	rm -r ${CURDIR}/storage/* || true
	docker run --rm \
		-v ${CURDIR}:/app \
		--env-file ${CURDIR}/.env \
			${DOCKER_IMAGE}:${DOCKER_TAG} \
				suite $(SUITE_NAME)
