FROM openalpr/openalpr

RUN apt-get update && apt-get install -y \
        curl
        
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -

RUN apt-get install -y \
    nodejs

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json index.js /usr/src/app/

RUN npm install

EXPOSE 9999
ENTRYPOINT [ "npm", "start" ]
