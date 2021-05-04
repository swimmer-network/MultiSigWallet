FROM node:8

RUN apt-get update && apt-get install -y libusb-1.0-0-dev
RUN npm install -g node-gyp
RUN npm install -g grunt-cli

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json ./
COPY Gruntfile.js ./

USER node

RUN npm install
COPY --chown=node:node . .

EXPOSE 5001

CMD ["npm", "start"]

 
