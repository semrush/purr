# Sources:
# https://github.com/GoogleChrome/puppeteer/blob/72866e9467ea124644412706e3ec196113cf5348/docs/troubleshooting.md#running-puppeteer-in-docker
# https://github.com/GoogleChrome/puppeteer/blob/72866e9467ea124644412706e3ec196113cf5348/.ci/node8/Dockerfile.linux
# https://github.com/joelgriffith/browserless/blob/master/Dockerfile
ARG PUPPETEER_ENV_IMAGE=puppeteer-environment
FROM node:18-slim as puppeteer-environment

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


FROM ${PUPPETEER_ENV_IMAGE} as app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

RUN chown node:node .
USER node

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive --production=true --network-timeout 240000 \
    && yarn cache clean

COPY --chown=node:node src ./src
CMD ["./src/cli.js"]


FROM app as cli-runner
COPY --chown=node:node data ./data

EXPOSE 8080
