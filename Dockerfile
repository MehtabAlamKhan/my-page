FROM node:14-alpine
WORKDIR /usr/my-page
COPY . .
RUN npm install

EXPOSE 443
CMD [ "npm" , "run", "start" ]