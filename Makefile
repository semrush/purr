override APPLICATION_NAME=purr

DOCKER_IMAGE?=ghcr.io/semrush/purr
DOCKER_TAG?=latest

.PHONY: yarn-install
yarn-install: docker-build
	rm -r ${CURDIR}/node_modules || true
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
		-e PUPPETEER_SKIP_DOWNLOAD=true \
		--entrypoint yarn \
			${DOCKER_IMAGE}:${DOCKER_TAG} \
				install --frozen-lockfile --non-interactive

.PHONY: yarn-lint
yarn-lint: docker-build
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
		-e PUPPETEER_SKIP_DOWNLOAD=true \
		--entrypoint yarn \
			${DOCKER_IMAGE}:${DOCKER_TAG} \
				run lint

.PHONY: lint
lint: yarn-lint

.PHONY: yarn-test
yarn-test: docker-build
	docker run --rm \
		-v ${CURDIR}:/app \
		-w /app \
		-e PUPPETEER_SKIP_DOWNLOAD=true \
		--entrypoint yarn \
			${DOCKER_IMAGE}:${DOCKER_TAG} \
				run test --bail

.PHONY: test
test: yarn-test

.PHONY: docker-build
docker-build:
	docker rmi --force ${DOCKER_IMAGE}:${DOCKER_TAG} || true
	docker build -f ${CURDIR}/docker/Dockerfile -t ${DOCKER_IMAGE}:${DOCKER_TAG} .

.PHONY: docker-compose-up
docker-compose-up:
	DOCKER_IMAGE=${DOCKER_IMAGE} DOCKER_TAG=${DOCKER_TAG} docker compose -p ${APPLICATION_NAME} up -d

.PHONY: docker-compose-down
docker-compose-down:
	docker compose -p ${APPLICATION_NAME} down --remove-orphans --volumes --rmi local

.PHONY: run-check
run-check: docker-build
ifeq (, $(check-name))
	$(error "Check name (argument check=...) is required")
endif
	rm -r ${CURDIR}/storage/* || true
	docker run --rm \
		-v ${CURDIR}:/app \
		--env-file ${CURDIR}/.env \
			${DOCKER_IMAGE}:${DOCKER_TAG} \
				check $(check-name)

.PHONY: run-suite
run-suite: docker-build
ifeq (, $(suite-name))
	$(error "Suite name (argument suite=...) is required")
endif
	rm -r ${CURDIR}/storage/* || true
	docker run --rm \
		-v ${CURDIR}:/app \
		--env-file ${CURDIR}/.env \
			${DOCKER_IMAGE}:${DOCKER_TAG} \
				suite $(suite-name)
