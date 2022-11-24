FROM node:12

WORKDIR /app
COPY kainos-chain.pem .
RUN ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime
RUN apt update && \
    apt upgrade -y && \
    apt clean

WORKDIR /app/ftts-booking-app
COPY ftts-booking-app/.npmrc .
COPY ftts-booking-app/packag*.json ./
RUN export NODE_EXTRA_CA_CERTS=/app/kainos-chain.pem && \
    npm install -g npm@7.9.0 && \
    npm install

COPY ftts-booking-app/ ./
COPY .env .

RUN npm run build

ENTRYPOINT [ "npm", "run", "local:watch" ]
