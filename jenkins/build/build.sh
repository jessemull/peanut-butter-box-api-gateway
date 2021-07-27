#!/bin/bash

IMAGE_TAG=node-test:${BUILD_ID}

docker build -t $IMAGE_TAG -f ./jenkins/build/Dockerfile .