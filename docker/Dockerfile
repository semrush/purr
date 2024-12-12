ARG NODE_VERSION=23.4

FROM node:${NODE_VERSION} AS vendor

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm ci --omit dev

FROM node:${NODE_VERSION}

ARG CHROMIUM_VERSION=131.0.*
ENV CHROMIUM_VERSION=${CHROMIUM_VERSION}
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt update && \
    apt install -y --no-install-recommends \
      chromium-common=${CHROMIUM_VERSION}  \
      chromium=${CHROMIUM_VERSION} \
      chromium-sandbox=${CHROMIUM_VERSION} && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* || true

WORKDIR /app

COPY jsconfig.json /app
COPY package.json /app
COPY package-lock.json /app
COPY src /app/src
COPY data /app/data
RUN chown -R node:node /app

COPY --from=vendor --chown=node:node /app/node_modules /app/node_modules

USER node

ENTRYPOINT ["/app/src/cli.js"]
