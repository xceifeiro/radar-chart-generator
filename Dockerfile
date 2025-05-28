# Use imagem com glibc para evitar problemas com bibliotecas nativas
FROM node:18-slim

# Atualize o sistema e instale dependências do sharp
RUN apt-get update && apt-get install -y \
    libvips-dev \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Crie diretório da aplicação
WORKDIR /app

# Copie os arquivos de dependência primeiro
COPY package*.json ./

# Instale as dependências com suporte a módulos nativos
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Faça o build da aplicação Next.js
RUN npm run build

# Exponha a porta padrão
EXPOSE 3000

# Defina as variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Comando para iniciar a aplicação
CMD ["npm", "start"]
