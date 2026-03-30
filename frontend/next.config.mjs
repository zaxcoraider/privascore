function patchWasmModuleImport(config, isServer) {
  config.experiments = Object.assign(config.experiments || {}, {
    asyncWebAssembly: true,
    layers: true,
    topLevelAwait: true,
  });

  config.optimization.moduleIds = "named";
  config.module.rules.push({
    test: /\.wasm$/,
    type: "asset/resource",
  });

  if (isServer) {
    config.output.webassemblyModuleFilename = "./../static/wasm/tfhe_bg.wasm";
  } else {
    config.output.webassemblyModuleFilename = "static/wasm/tfhe_bg.wasm";
    config.output.environment = {
      ...config.output.environment,
      asyncFunction: true,
    };
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config, { isServer }) => {
    patchWasmModuleImport(config, isServer);
    return config;
  },
};

export default nextConfig;

