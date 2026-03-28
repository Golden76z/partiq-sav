

const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse"],
  typescript: {
    tsconfigPath: "tsconfig.next.json",
  },
};

export default nextConfig;
