FROM node:12
RUN apt-get update
RUN apt install yarn -y
COPY package.json /src/package.json
RUN  cd /src; yarn install; yarn postinstall;
COPY . /src
EXPOSE 3000 80
WORKDIR /src

CMD yarn start