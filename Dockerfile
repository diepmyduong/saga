FROM node:18-alpine AS base

# install curl
RUN apk update && apk add curl busybox-extras

######## Prepare package.json and pnpm-lock.yaml
FROM base AS package

COPY package.json package-lock.json ./
RUN npm version --allow-same-version 1.0.0

######## Preperation
FROM node:18-alpine AS deps

COPY --from=package package.json package-lock.json ./
RUN npm install

######## Building
FROM base AS build

WORKDIR /app

COPY --from=deps node_modules ./node_modules
COPY . .

RUN npm run build api
RUN npm run build worker
RUN npm run build migration

## prune devDependencies
RUN npm prune --omit=dev

######## Deploy
FROM base AS deploy

WORKDIR /app

## COPY  node_modules
COPY --from=build /app/node_modules ./node_modules
## COPY build files
COPY --from=build /app/dist ./dist
COPY --from=build /app/config ./config
COPY --from=build /app/workers ./workers

## COPY package.json
COPY package.json package-lock.json ./

EXPOSE 5555

CMD [ "npm", "start"]