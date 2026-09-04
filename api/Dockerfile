FROM node:22-alpine
WORKDIR /app
COPY api/package.json api/package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force
COPY api/server.js ./api/server.js
COPY lib/opengym-storage.js ./lib/opengym-storage.js
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "api/server.js"]
