/** @type {import('next').NextConfig} */
const nextConfig = {
  // Para gerar versão desktop com Tauri, descomente a linha abaixo:
  // output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
