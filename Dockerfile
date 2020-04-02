FROM node:12.16.1-buster-slim

ENV SITESPEED_IO_BROWSERTIME__DOCKER true
ENV SITESPEED_IO_BROWSERTIME__VIDEO false
ENV SITESPEED_IO_BROWSERTIME__BROWSER firefox
ENV SITESPEED_IO_BROWSERTIME__VISUAL_METRICS false
ENV SITESPEED_IO_BROWSERTIME__HEADLESS true
ENV CHROMEDRIVER_SKIP_DOWNLOAD true
ENV EGDEDRIVER_SKIP_DOWNLOAD true

ENV FIREFOX_VERSION 74.0

ENV PATH="/usr/local/bin:${PATH}"

RUN apt-get update && apt -y install vim

RUN buildDeps='wget bzip2' && apt-get update && apt -y install $buildDeps && \
    # Download and unpack the correct Firefox version
    wget https://ftp.mozilla.org/pub/firefox/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2 && \
    tar -xjf firefox-${FIREFOX_VERSION}.tar.bz2 && \
    rm firefox-${FIREFOX_VERSION}.tar.bz2 && \
    mv firefox /opt/ && \
    ln -s /opt/firefox/firefox /usr/local/bin/firefox && \
    # Install dependencies for Firefox
    apt-get install -y --no-install-recommends --no-install-suggests \
        `apt-cache depends firefox-esr | awk '/Depends:/{print$2}'` && \
    # iproute2 = tc
    apt -y install tcpdump iproute2 ca-certificates sudo --no-install-recommends --no-install-suggests && \
    # Cleanup
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false $toolDeps \
    && rm -rf /var/lib/apt/lists/* /tmp/*

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN CHROMEDRIVER_SKIP_DOWNLOAD=true EGDEDRIVER_SKIP_DOWNLOAD=true npm install --production

WORKDIR /usr/src/app
COPY docker/scripts/start-slim.sh /start.sh

# Allow all users to run commands needed by sitespeedio/throttle via sudo
# See https://github.com/sitespeedio/throttle/blob/master/lib/tc.js
RUN echo 'ALL ALL=NOPASSWD: /usr/sbin/tc, /usr/sbin/route, /usr/sbin/ip' > /etc/sudoers.d/tc



# ENTRYPOINT ["npm","start"]
ENTRYPOINT ["bash","/start.sh"]

VOLUME /sitespeed.io
WORKDIR /sitespeed.io

