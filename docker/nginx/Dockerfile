FROM nginx

# Install gcsfuse to use buckets in gke
RUN : \
  && apt-get update \
  && apt-get install -yq --no-install-recommends gnupg2 curl ca-certificates \
  && echo "deb http://packages.cloud.google.com/apt gcsfuse-stretch main" >> /etc/apt/sources.list.d/gcsfuse.list \
  && curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - \
  && apt-get update \
  && apt-get install -yq --no-install-recommends gcsfuse \
  && rm -rf /var/lib/apt/lists/* /src/*.deb /tmp/* /var/tmp/*
