import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import JavaScriptObfuscator from 'javascript-obfuscator';

/**
 * 安全代碼混淆外掛 (Safe Code Obfuscator)
 * 1. 僅在正式 build 打包時啟動，開發環境極速 hot-reload 不受影響
 * 2. 自動排除第三方大型庫 (jspdf, html2canvas, purify)，100% 避免核心功能崩潰
 * 3. 對專案主代碼與敏感字串進行 Base64/亂數陣列查表加密與變數名碎化 (Mangle)
 */
function safeObfuscatorPlugin() {
  return {
    name: 'vite-plugin-safe-obfuscator',
    apply: 'build',
    enforce: 'post',
    renderChunk(code, chunk) {
      // 嚴格排除第三方核心函式庫，確保列印/PDF/DOM運算不受影響
      const excludePatterns = ['html2canvas', 'jspdf', 'purify', 'vendor'];
      const shouldExclude = excludePatterns.some(name => chunk.fileName.toLowerCase().includes(name));
      if (shouldExclude) {
        return null;
      }

      try {
        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
          compact: true,
          controlFlowFlattening: false, // 確保手機瀏覽器效能不卡頓
          deadCodeInjection: false,
          identifierNamesGenerator: 'mangled',
          renameGlobals: false,
          rotateStringArray: true,
          selfDefending: false,
          shuffleStringArray: true,
          splitStrings: true,
          splitStringsChunkLength: 5,
          stringArray: true,
          stringArrayEncoding: ['base64'], // 將機敏字串與密碼轉為加密查表
          stringArrayThreshold: 0.75,
          transformObjectKeys: false,
          unicodeEscapeSequence: false
        });

        return {
          code: obfuscationResult.getObfuscatedCode(),
          map: null
        };
      } catch (err) {
        console.warn(`[Obfuscator] 檔案 ${chunk.fileName} 混淆跳過:`, err);
        return null;
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    safeObfuscatorPlugin()
  ],
  build: {
    // 嚴格關閉 source map，徹底杜絕瀏覽器 DevTools 反查原始碼
    sourcemap: false
  }
});
