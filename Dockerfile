FROM node:20.11.0-alpine AS deps

WORKDIR /usr/src/tarpisto

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20.11.0-alpine as runner

ENV PORT 9000
ENV ENV production
ENV NODE_ENV production
ENV APP_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /usr/src/tarpisto

# Bash for starting server, curl for container health checking
RUN apk add --no-cache bash curl

COPY --from=deps /usr/src/tarpisto/node_modules ./node_modules
COPY . .

CMD ["bash", "./scripts/start-prod-server.sh"]