# Sources:
# https://github.com/GoogleChrome/puppeteer/blob/72866e9467ea124644412706e3ec196113cf5348/docs/troubleshooting.md#running-puppeteer-in-docker
# https://github.com/GoogleChrome/puppeteer/blob/72866e9467ea124644412706e3ec196113cf5348/.ci/node8/Dockerfile.linux
# https://github.com/joelgriffith/browserless/blob/master/Dockerfile
ARG NODE_VERSION=18-slim
ARG PUPPETEER_ENV_IMAGE=puppeteer-environment
FROM node:${NODE_VERSION} as puppeteer-environment

ENV DEBIAN_FRONTEND noninteractive

# Install latest chrome package and fonts to support major charsets
# (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of
# Chromium that Puppeteer installs, work.
RUN apt update -qq \
  && apt install -qq -y --no-install-recommends \
  curl \
  gnupg \
  ca-certificates \
  chromium \
  chromium-sandbox \
  fonts-ipafont-gothic \
  fonts-wqy-zenhei \
  fonts-thai-tlwg \
  fonts-kacst \
  fonts-freefont-ttf \
  libxss1 \
  && rm -rf /var/lib/apt/lists/* /src/*.deb /tmp/* /var/tmp/*

FROM ${PUPPETEER_ENV_IMAGE} as vendor

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive --production=true --network-timeout 240000

FROM ${PUPPETEER_ENV_IMAGE} as app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY --chown=node:node src ./src
COPY --chown=node:node data ./data
COPY --chown=node:node --from=vendor /app/node_modules ./node_modules

RUN chown node:node .
USER node

ENTRYPOINT ["/app/src/cli.js"]
