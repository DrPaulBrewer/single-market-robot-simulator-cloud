FROM digitallyseamless/nodejs-bower-grunt:latest
MAINTAINER drpaulbrewer@eaftc.com
RUN apt-get update && apt-get --yes install curl zip git
WORKDIR /single-market-robot-simulator-cloud
COPY * /single-market-robot-simulator-cloud
RUN npm install
CMD grunt --verbose
