# Etapa 1: Instala as dependências e gera o build
FROM node:18-alpine AS builder

WORKDIR /app

# Instala as dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código
COPY . .

# Faz o build da aplicação Next.js
RUN npm run build


# Etapa 2: Cria a imagem final, apenas com os arquivos necessários
FROM node:18-alpine AS runner

WORKDIR /app

# Copia apenas os arquivos necessários da etapa de build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Exponha a porta que o Next utiliza
EXPOSE 3000

# Defina as variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para rodar a aplicação
CMD ["npx", "next", "start"]
