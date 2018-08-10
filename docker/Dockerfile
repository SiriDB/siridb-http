FROM golang:alpine
MAINTAINER Transceptor Technology
# RUN apk add git python3 nodejs-npm libc-dev
RUN apk add git python3 nodejs-npm
WORKDIR /src
RUN npm install -g less less-plugin-clean-css
RUN git clone https://github.com/SiriDB/siridb-http ./
RUN ./gobuild.py -i -l -w -b -p -o siridb-http

FROM alpine:latest
COPY --from=0 /src/siridb-http /usr/local/bin/siridb-http
# Client connections
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/siridb-http"]
