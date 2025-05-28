# Use a imagem oficial do Node.js
FROM node:18-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências
COPY package.json package-lock.json* ./

# Instale as dependências
RUN npm ci --only=production

# Copie todo o código da aplicação
COPY . .

# Faça o build da aplicação Next.js
RUN npm run build

# Exponha a porta 3000
EXPOSE 3000

# Defina as variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
