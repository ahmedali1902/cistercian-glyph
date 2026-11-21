import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Served from https://ahmedali1902.github.io/cistercian-glyph/ on GitHub Pages
  base: '/cistercian-glyph/',
  plugins: [tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] })],
});
