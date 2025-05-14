import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => ['drag', 'drop', 'model-viewer'].includes(tag)
        }
      }
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  build: {
    sourcemap: true
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      vue: 'vue/dist/vue.esm-bundler.js',
      '@arch-inc/fabricjs-psbrush': path.resolve(
        __dirname,
        'node_modules/@arch-inc/fabricjs-psbrush/dist/index.js'
      )
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/variables.scss" as *;`,
        api: 'modern'
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 8080,
    proxy: {
      // '/AiPainting': {
      //   target: 'http://127.0.0.1:7860',
      //   rewrite: path => path.replace(/^\/AiPainting/, '')
      // },
      // '/assets': {
      //   target: 'http://127.0.0.1:7860'
      // },
      // '/file': {
      //   target: 'http://127.0.0.1:7860',
      //   rewrite: path => path.replace(/^\/AiPainting/, '')
      // },
      // '/styles': {
      //   target: 'http://127.0.0.1:7860',
      //   rewrite: path => path.replace(/^\/AiPainting/, '')
      // },
      // '/AiPainting/physton_prompt/styles': {
      //   target: 'http://127.0.0.1:7860'
      // },
      '/api': {
        target: process.env.KITSU_API_TARGET || 'http://127.0.0.1:50025'
        //changeOrigin: true,
        //rewrite: path => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: process.env.KITSU_EVENT_TARGET || 'http://127.0.0.1:50025',
        ws: true
      },
      '/Doodle-3.6.571-win64.zip': {
        target: process.env.KITSU_API_TARGET || 'http://127.0.0.1:50025'
      }
    }
  },
  test: {
    globals: true,
    threads: false,
    environment: 'jsdom',
    setupFiles: ['vitest-localstorage-mock', 'tests/unit.setup.js'],
    mockReset: false
  }
})
