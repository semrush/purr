ARG NODE_VERSION=20.6

FROM node:${NODE_VERSION} as vendor

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

RUN yarn install --frozen-lockfile --production=true

FROM node:${NODE_VERSION}

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      chromium \
      chromium-sandbox && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* || true

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY --chown=node:node src /app/src
COPY --chown=node:node data /app/data
RUN chown node:node /app

COPY --from=vendor /app/node_modules /app/node_modules

USER node
ENTRYPOINT ["/app/src/cli.js"]
