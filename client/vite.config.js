import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy: {
      '/backend':{
        target:'https://mern-auth-tawny.vercel.app/',
        secure: false,
      },
    }
  },
});
