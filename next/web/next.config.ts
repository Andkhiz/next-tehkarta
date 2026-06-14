/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем новые экспериментальные сборщики, форсируя использование стабильного Webpack
  transpilePackages: ['@prisma/client'],
};

export default nextConfig;
