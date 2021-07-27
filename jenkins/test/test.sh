#!/bin/bash

IMAGE_TAG=node-test:${BUILD_ID}

docker build -t $IMAGE_TAG -f ./jenkins/test/Dockerfile .
docker run --rm $IMAGE_TAG npm test