# ── Stage 1: build the React app ─────────────────────────────────────────────
FROM node:18 AS build

WORKDIR /app

# Copy package files first so npm install is cached unless dependencies change
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ── Stage 2: serve the built app with Vite preview ───────────────────────────
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the built dist folder from stage 1
COPY --from=build /app/dist ./dist

EXPOSE 5173

# --host 0.0.0.0 makes the server accessible outside the container
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
