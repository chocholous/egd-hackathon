FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY server.mjs ./
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
