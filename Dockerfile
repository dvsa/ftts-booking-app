FROM node:12

WORKDIR /app
COPY kainos-chain.pem .
RUN ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime

WORKDIR /app/ftts-booking-app/ftts-frontend-assets
COPY ftts-booking-app/ftts-frontend-assets ./
RUN npm install && \
    npm run generate-assets

WORKDIR /app/ftts-booking-app
COPY ftts-booking-app/.npmrc .
COPY ftts-booking-app/packag*.json ./
RUN export NODE_EXTRA_CA_CERTS=/app/kainos-chain.pem && \
    npm install
COPY ftts-booking-app/ ./
COPY .env .
RUN npm run build:local

ENTRYPOINT [ "npm", "run", "local:watch" ]
