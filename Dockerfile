FROM node:alpine

WORKDIR /usr/my-page
COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 443
CMD [ "npm" , "run", "start" ]