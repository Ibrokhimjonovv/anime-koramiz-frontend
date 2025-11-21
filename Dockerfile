# 1️⃣ Base image
FROM node:22-alpine

WORKDIR /app

# 2️⃣ Copy package files
COPY package*.json ./

# 3️⃣ Install all dependencies (build uchun devDependencies kerak)
RUN npm install

# 4️⃣ Copy source code
COPY . .

# 5️⃣ Build Vite app
RUN npm run build

# 6️⃣ Install static server
RUN npm install -g serve

# 7️⃣ Expose port
EXPOSE 5173

# 8️⃣ Serve production build
CMD ["serve", "-s", "dist", "-l", "5173"]
