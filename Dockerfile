# -----------------------
# Pawbs Engine Dockerfile
# -----------------------

# syntax = docker/dockerfile:1

# Node.js version
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base
LABEL fly_launch_runtime="Node.js"

# Base working directory
WORKDIR /app

# Environment variable
ENV NODE_ENV="production"


# Build Stage

# Initialize build stage
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci

# Copy application code
COPY . .


# Final Stage

# Initialize final stage
FROM base

# Copy built application
COPY --from=build /app /app

# Set working directory to servers directory
WORKDIR /app/src/servers

# Expose both dedicated server and HTTP server ports
EXPOSE 3000 4000 5000

# Start both dedicated server and HTTP server concurrently with 'container' flag
CMD ["npm", "run", "container"]