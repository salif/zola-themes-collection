FROM alpine:edge
RUN apk upgrade --no-cache
RUN apk --update --no-cache add zola git just nodejs npm
RUN mkdir /src && chown 1000:1000 /src
USER 1000:1000
WORKDIR /src
