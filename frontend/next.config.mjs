import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/**
 * @param {string} phase
 * @returns {import('next').NextConfig}
 */
export default function createNextConfig(phase) {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    // 将开发态产物与 next build 的 .next 隔离，避免旧 chunk 污染开发服务器。
    distDir: isDevServer ? ".next-dev" : ".next",
    experimental: {
      // 规避 Next.js 15.5.15 开发态 Segment Explorer 导致的 React Client Manifest 异常
      devtoolSegmentExplorer: false
    }
  };
}
