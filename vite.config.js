import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';

const noExternal = [
  '@mui/material',
  '@mui/system',
  '@mui/icons-material',
  '@mui/styled-engine',
  '@emotion/react',
  '@emotion/styled',
  '@emotion/cache'
];

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    svgr()
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@emotion/react': path.resolve(
        __dirname,
        'node_modules/@emotion/react'
      ),
      '@emotion/styled': path.resolve(
        __dirname,
        'node_modules/@emotion/styled'
      ),
      '@emotion/cache': path.resolve(
        __dirname,
        'node_modules/@emotion/cache'
      ),
    },
  },
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@mui/material',
      '@mui/icons-material',
      '@mui/system',
    ],
    force: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.jsx'),
      name: 'OpenIMISFeMedical',
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'redux',
        'redux-thunk',
        'redux-api-middleware',
        'react-redux',
        'react-intl',
        'react-helmet',
        'react-multi-date-picker',
        'prop-types',
        'react-date-object/calendars/gregorian',
        'react-date-object/locales/gregorian_en',
        'nepali-date-converter',
        'moment',
        'lodash',
        /^lodash\/.*$/,
        'lodash-uuid',
        'classnames',
        'clsx',
        'react-autosuggest',
        'react-router',
        'react-router-dom',
        'history',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/cache',
        '@mui/material',
        '@mui/icons-material',
        '@mui/system',
     
        '@date-io/core',
        '@date-io/moment',
        'zxcvbn',
        'flat',
 
        /^@babel-.*/,
        /^@date-io\/.*/,
        /^@openimis.*/
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react/jsx-dev-runtime': 'jsxDevRuntime',
          '@emotion/react': 'EmotionReact',
          '@emotion/styled': 'EmotionStyled',
          '@mui/material': 'MuiMaterial',
        },
      },
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  ssr: {
    noExternal,
  },
});