import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.jsx'),
      name: 'OpenIMISFeMedical',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'es' : 'js'}`
    },
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'redux',
        'redux-api-middleware',
        'react-redux',
        'react-intl',
        'prop-types',
        'moment',
        'lodash',
        /^lodash\/.*/,
        'lodash-uuid',
        'classnames',
        'clsx',
        'react-autosuggest',
        'react-router',
        'react-router-dom',
        'history',
        '@material-ui/core',
        '@material-ui/icons',
        '@material-ui/lab',
        '@material-ui/pickers',
        '@material-ui/styles',
        '@date-io/core',
        '@date-io/moment',
        /^@material-ui\/icons\/.*/,
        /^@material-ui\/core\/.*/,
        /^@material-ui\/lab\/.*/,
        /^@babel-.*/,
        /^@openimis.*/
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    exclude: ['react-dom']
  }
})