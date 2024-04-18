import { defineConfig } from 'electron-vite'
import { resolve, join } from 'path'
import vue from '@vitejs/plugin-vue2'

export default defineConfig(() => {
  const PACKAGE_ROOT = __dirname
  return {
    main: {
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'electron/main/index.ts')
          }
        }
      }
    },
    preload: {
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'electron/preload/index.ts')
          }
        }
      }
    },
    renderer: {
      plugins: [vue()],
      root: '.',
      build: {
        minify: true,
        sourcemap: true,
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'index.html')
          }
        },
        outDir: 'dist'
      },
      resolve: {
        vue: 'vue/dist/vue.esm.js',
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
        alias: [
          {
            find: '@',
            replacement: join(PACKAGE_ROOT, 'src') + '/'
          }
        ]
      },
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `@import "@/variables.scss";`
          }
        }
      }
    }
  }
})
