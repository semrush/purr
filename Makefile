override APPLICATION_NAME=purr
override NODE_VERSION=21.7

DOCKER_IMAGE?=ghcr.io/semrush/purr
DOCKER_TAG?=latest
CHECK_NAME:=example-com
SUITE_NAME:=example-com-suite

.PHONY: npm-install
npm-install:
	rm -r ${CURDIR}/node_modules || true
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
			node:${NODE_VERSION} \
				npm ci

.PHONY: vendor
vendor: npm-install

.PHONY: npm-lint
npm-lint:
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
			node:${NODE_VERSION} \
				npm run lint

.PHONY: lint
lint: npm-lint

.PHONY: npm-test
npm-test:
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
			node:${NODE_VERSION} \
				npm run test

.PHONY: test
test: npm-test

.PHONY: docker-build
docker-build:
	docker rmi --force ${DOCKER_IMAGE}:${DOCKER_TAG} || true
	docker build -f ${CURDIR}/docker/Dockerfile -t ${DOCKER_IMAGE}:${DOCKER_TAG} .

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
