FROM node:14
RUN mkdir -p /opt/app
WORKDIR /opt/app
#RUN useradd app
COPY . .
RUN npm install
#RUN chown -R app:app /opt/app
# USER app
EXPOSE 2222
CMD ["npm", "start"]
