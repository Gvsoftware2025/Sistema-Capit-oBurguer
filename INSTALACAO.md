# Como criar o instalador .exe do Capitao Burguer

## Pre-requisitos

Antes de gerar o instalador, voce precisa instalar no seu computador:

### 1. Node.js
Baixe e instale: https://nodejs.org/
(escolha a versao LTS)

### 2. Rust
Baixe e instale: https://www.rust-lang.org/tools/install
- No Windows, baixe o rustup-init.exe e execute
- Vai pedir para instalar o Visual Studio Build Tools, aceite

### 3. WebView2 (Windows)
Geralmente ja vem instalado no Windows 10/11.
Se nao tiver: https://developer.microsoft.com/microsoft-edge/webview2/

---

## Passo a passo para gerar o .exe

### 1. Extraia o projeto
Extraia o ZIP do projeto em uma pasta (ex: C:\capitao-burguer)

### 2. Abra o terminal
Abra o Prompt de Comando ou PowerShell na pasta do projeto

### 3. Instale as dependencias
```bash
npm install
```

### 4. Gere o instalador
```bash
npm run tauri:build
```

### 5. Encontre o instalador
Apos o build (pode demorar alguns minutos), o instalador estara em:
```
src-tauri/target/release/bundle/nsis/Capitao Burguer_1.0.0_x64-setup.exe
```

---

## Instalando o programa

1. Execute o arquivo `Capitao Burguer_1.0.0_x64-setup.exe`
2. Siga as instrucoes do instalador (Avanccar, Aceitar termos, etc)
3. O programa sera instalado e criara um atalho na area de trabalho

---

## Importante

Este sistema precisa de conexao com o banco de dados PostgreSQL para funcionar.
Certifique-se de que as variaveis de ambiente estao configuradas:

- `POSTGRES_URL` - URL de conexao do banco de dados

Voce pode criar um arquivo `.env` na pasta do projeto com:
```
POSTGRES_URL=postgresql://usuario:senha@host:5432/banco
```

---

## Problemas comuns

### Erro "Rust nao encontrado"
Instale o Rust e reinicie o terminal

### Erro de build do Next.js
Execute `npm run build` primeiro para verificar erros

### Erro de permissao no Windows
Execute o terminal como Administrador
