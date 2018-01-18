FROM golang:alpine
RUN apk update && \
    apk upgrade && \
    apk add git python3 nodejs-npm && \
    npm install -g less less-plugin-clean-css && \
    git clone https://github.com/transceptor-technology/siridb-http.git /tmp/siridb-http && \
    cd /tmp/siridb-http && ./gobuild.py -i -l -w -b -p -o siridb-http

FROM alpine:latest
COPY --from=0 /tmp/siridb-http/siridb-http /usr/local/bin/
# Client connections
EXPOSE 5050
ENTRYPOINT ["/usr/local/bin/siridb-http"]
