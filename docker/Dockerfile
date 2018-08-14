FROM golang:alpine

ADD . /tmp/siridb-http
RUN apk --no-cache add git python3 nodejs-npm && \
    npm install -g less less-plugin-clean-css && \
    cd /tmp/siridb-http && ./gobuild.py -i -l -w -b -p -o siridb-http

FROM alpine:latest

RUN apk update && \
    apk --no-cache add bash

COPY --from=0 /tmp/siridb-http/siridb-http /usr/local/bin/
COPY docker/run.sh /
# Client connections
EXPOSE 5050

ENV SIRIDB_USERNAME user
ENV SIRIDB_PASSWORD secret
ENV SIRIDB_DATABASE db
ENV SIRIDB_SERVERS localhost
ENV HTTP_PORT 5050
ENV SIRIDB_HTTP_CONFIG /siridb-http.conf

ENTRYPOINT ["/run.sh"]
