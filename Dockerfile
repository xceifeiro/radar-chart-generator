# Use a imagem oficial do Node.js
FROM node:18-alpine

# Instalar dependências do sistema necessárias para Sharp
RUN apk add --no-cache \
    libc6-compat \
    vips-dev

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm ci

# Copie todo o código da aplicação
COPY . .

# Faça o build da aplicação Next.js
RUN npm run build

# Exponha a porta 3000
EXPOSE 3000

# Defina as variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Comando para iniciar a aplicação
CMD ["npm", "start"]
