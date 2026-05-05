# syntax=docker/dockerfile:1.7
FROM node:20-alpine
WORKDIR /app

# Install deps in their own layer for caching
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Source is bind-mounted at runtime via compose; this COPY exists so the image is
# self-contained when run without a mount.
COPY . .

EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
