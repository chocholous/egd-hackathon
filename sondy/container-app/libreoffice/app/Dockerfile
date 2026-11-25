# LibreOffice headless + fonty metricky kompatibilní s MS Office (Carlito = Calibri, Caladea = Cambria,
# Liberation = Arial/Times/Courier) + Node API, které ověří token Entra a zavolá soffice.
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      libreoffice-writer-nogui libreoffice-calc-nogui libreoffice-impress-nogui \
      fonts-crosextra-carlito fonts-crosextra-caladea fonts-liberation2 fonts-dejavu-core fontconfig \
    && rm -rf /var/lib/apt/lists/* && fc-cache -f
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.mjs ./
ENV PORT=8080 HOME=/tmp
EXPOSE 8080
USER node
CMD ["node", "server.mjs"]
