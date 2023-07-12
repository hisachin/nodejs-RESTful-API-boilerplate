FROM node:18-alpine

ENV NODE_ENV=development

WORKDIR /home/node/app

# Install wget utility
RUN apk add --no-cache wget

# Download wait-for-it.sh
RUN wget -O /usr/local/bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /usr/local/bin/wait-for-it.sh

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

EXPOSE 3000

# Update CMD to use wait-for-it.sh
CMD ["wait-for-it.sh", "mongodb:27017", "--", "node", "src/index.js"]
