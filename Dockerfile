# Use a imagem oficial do Node.js com glibc
FROM node:18-slim

# Atualize o sistema e instale dependências do sharp
RUN apt-get update && apt-get install -y \
  libvips-dev \
  build-essential \
  python3 \
  && rm -rf /var/lib/apt/lists/*

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências sem opcionais
RUN npm install --omit=optional

# Copie o restante do código da aplicação
COPY . .

# Faça o build da aplicação Next.js
RUN npm run build

# Exponha a porta da aplicação
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Comando para iniciar a aplicação
CMD ["npm", "start"]
