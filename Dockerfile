# syntax=docker/dockerfile:1
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=22.16.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV development
ENV VITE_ALLOW_WARNINGS=true


WORKDIR /usr/src/app

# Download dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 5173

# Run the application.
CMD npm run dev
