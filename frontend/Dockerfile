FROM node:20-bullseye AS build

RUN groupadd -r appgroup && useradd -r -u 1001 -g appgroup appuser
WORKDIR /app
COPY --chown=appuser:appgroup package*.json ./
RUN npm cache clean --force && \
    npm install --legacy-peer-deps
COPY --chown=appuser:appgroup . .
RUN npx tsc && npx vite build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
