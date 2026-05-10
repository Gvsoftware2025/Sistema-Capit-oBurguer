# Guia de Instalação - Capitão Burguer Desktop (.exe)

Este guia explica como transformar o sistema web em um aplicativo desktop instalável (.exe).

---

## Passo 1: Instalar Requisitos

### 1.1 Instalar Node.js
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (recomendada)
3. Execute o instalador e siga as instruções
4. Para verificar, abra o CMD e digite:
   ```
   node --version
   ```

### 1.2 Instalar Rust
1. Acesse: https://www.rust-lang.org/tools/install
2. Baixe o `rustup-init.exe`
3. Execute e escolha a instalação padrão (opção 1)
4. Reinicie o computador
5. Para verificar, abra o CMD e digite:
   ```
   rustc --version
   ```

### 1.3 Instalar Build Tools do Windows
1. Acesse: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Baixe o "Build Tools for Visual Studio"
3. Na instalação, marque:
   - "Desenvolvimento para desktop com C++"
4. Aguarde a instalação (pode demorar uns 10-15 minutos)

---

## Passo 2: Baixar o Projeto

1. No v0, clique nos 3 pontinhos no canto superior direito
2. Clique em "Download ZIP"
3. Extraia o ZIP em uma pasta (ex: `C:\capitao-burguer`)

---

## Passo 3: Configurar o Tauri

Abra o CMD como Administrador e execute:

```bash
# Entrar na pasta do projeto
cd C:\capitao-burguer

# Instalar dependências do projeto web
npm install

# Instalar o CLI do Tauri
npm install -D @tauri-apps/cli@latest

# Inicializar o Tauri no projeto
npx tauri init
```

Quando perguntar:
- **What is your app name?** → `Capitao Burguer`
- **What should the window title be?** → `Capitão Burguer - Sistema de Gestão`
- **Where are your web assets located?** → `../out`
- **What is the URL of your dev server?** → `http://localhost:3000`
- **What is your frontend dev command?** → `npm run dev`
- **What is your frontend build command?** → `npm run build`

---

## Passo 4: Configurar o Build Estático

Abra o arquivo `next.config.mjs` e altere para:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

---

## Passo 5: Configurar o package.json

Adicione estes scripts no `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

---

## Passo 6: Configurar o Tauri (tauri.conf.json)

O arquivo está em `src-tauri/tauri.conf.json`. Altere:

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:3000",
    "distDir": "../out"
  },
  "package": {
    "productName": "Capitao Burguer",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.capitaoburguer.app",
      "targets": "all"
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 800,
        "width": 1200,
        "resizable": true,
        "title": "Capitão Burguer - Sistema de Gestão",
        "center": true
      }
    ]
  }
}
```

---

## Passo 7: Adicionar Ícone

1. Copie o arquivo `public/logo.png` para `src-tauri/icons/`
2. Renomeie para `icon.png`
3. Execute no CMD:
   ```bash
   npx tauri icon src-tauri/icons/icon.png
   ```
   Isso gera todos os tamanhos necessários.

---

## Passo 8: Gerar o .exe

```bash
npm run tauri:build
```

Aguarde a compilação (primeira vez demora uns 5-10 minutos).

O instalador `.exe` estará em:
```
src-tauri/target/release/bundle/nsis/Capitao Burguer_1.0.0_x64-setup.exe
```

---

## Passo 9: Instalar

1. Encontre o arquivo `.exe` gerado
2. Execute como administrador
3. Siga o instalador
4. Pronto! O aplicativo aparece no Menu Iniciar

---

## Problemas Comuns

### Erro: "rustc not found"
- Reinicie o computador após instalar o Rust

### Erro: "MSVC not found"
- Instale o Build Tools do Visual Studio (passo 1.3)

### Erro na compilação do Tauri
- Execute: `rustup update`

### A página fica em branco
- Verifique se o `output: 'export'` está no next.config.mjs
- Verifique se o `distDir` está como `"../out"`

---

## Dicas

- **Atualizar o app**: Altere a versão no `tauri.conf.json` e gere novamente
- **Testar antes de buildar**: Use `npm run tauri:dev`
- **Tamanho final**: O .exe terá aproximadamente 10-15MB

---

## Suporte

Se tiver problemas:
1. Documentação Tauri: https://tauri.app/v1/guides/
2. Documentação Rust: https://www.rust-lang.org/learn
