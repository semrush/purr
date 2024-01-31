ARG NODE_VERSION=21.6

FROM node:${NODE_VERSION} as vendor

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm ci --omit dev

FROM node:${NODE_VERSION}

ARG CHROMIUM_VERSION=121.0.6167.85-1~deb12u1
ENV CHROMIUM_VERSION=${CHROMIUM_VERSION}
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt update && \
    apt install -y --no-install-recommends \
      chromium=${CHROMIUM_VERSION} \
      chromium-sandbox=${CHROMIUM_VERSION} && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* || true

USER node
WORKDIR /app

COPY jsconfig.json /app
COPY package.json /app
COPY package-lock.json /app
COPY --chown=node:node src /app/src
COPY --chown=node:node data /app/data
COPY --from=vendor --chown=node:node /app/node_modules /app/node_modules


ENTRYPOINT ["/app/src/cli.js"]
