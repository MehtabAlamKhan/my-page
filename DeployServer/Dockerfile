FROM node:alpine
WORKDIR /usr/deployServer
COPY . .
RUN npm install

EXPOSE 8080
CMD ["node", "deployServer.js"]