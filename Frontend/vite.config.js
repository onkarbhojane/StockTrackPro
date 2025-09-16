import { defineConfig,loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig(({mode})=>{
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.SOME_KEY': JSON.stringify(env.SOME_KEY)
    },
    plugins: [tailwindcss()],
  }
})