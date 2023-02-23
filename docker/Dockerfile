# Sources:
# https://github.com/GoogleChrome/puppeteer/blob/72866e9467ea124644412706e3ec196113cf5348/docs/troubleshooting.md#running-puppeteer-in-docker
# https://github.com/GoogleChrome/puppeteer/blob/72866e9467ea124644412706e3ec196113cf5348/.ci/node8/Dockerfile.linux
# https://github.com/joelgriffith/browserless/blob/master/Dockerfile
ARG PUPPETEER_ENV_IMAGE=puppeteer-environment
FROM node:18-slim as puppeteer-environment

# Install latest chrome package and fonts to support major charsets
# (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of
# Chromium that Puppeteer installs, work.
RUN apt-get update \
  && apt-get install -y curl gnupg \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && curl -s https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && apt-get update \
  && apt-get install -yq --no-install-recommends \
  google-chrome-stable \
  fonts-ipafont-gothic \
  fonts-wqy-zenhei \
  fonts-thai-tlwg \
  fonts-kacst \
  fonts-freefont-ttf \
  libxss1 \
  && rm -rf /var/lib/apt/lists/* /src/*.deb /tmp/* /var/tmp/*


FROM ${PUPPETEER_ENV_IMAGE} as app

WORKDIR /app

RUN chown node:node .
USER node


COPY package.json ./
COPY yarn.lock ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN yarn install --frozen-lockfile --non-interactive --silent --production=true \
    && yarn cache clean

COPY --chown=node:node src ./src
CMD ["./src/cli.js"]


FROM app as cli-runner
COPY --chown=node:node data ./data

EXPOSE 8080
