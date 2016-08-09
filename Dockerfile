FROM digitallyseamless/nodejs-bower-grunt:latest
MAINTAINER drpaulbrewer@eaftc.com
RUN apt-get update && apt-get --yes install curl zip git
RUN git clone https://github.com/DrPaulBrewer/single-market-robot-simulator-cloud.git
WORKDIR /single-market-robot-simulator-cloud
RUN npm install
CMD grunt --verbose
