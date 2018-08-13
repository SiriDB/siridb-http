FROM golang:alpine
RUN apk update && \
    apk upgrade && \
    apk add git python3 nodejs-npm bash && \
    npm install -g less less-plugin-clean-css && \
    git clone https://github.com/transceptor-technology/siridb-http.git /tmp/siridb-http && \
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

ENTRYPOINT ["/run.sh"]
