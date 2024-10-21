FROM arm64v8/node:14
WORKDIR /usr/my-page
COPY . .
RUN npm install

EXPOSE 443
CMD [ "npm" , "run", "start" ]