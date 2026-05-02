/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        scrap: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"PingFang SC"', '"Songti SC"', 'Georgia', 'serif'],
        brush: ['"Ma Shan Zheng"', '"Noto Serif SC"', 'cursive'],
      },
      colors: {
        beige: {
          50: '#fdfaf3',
          100: '#faf3e3',
          200: '#f3e6c4',
        },
        sunny: '#f7d774',
        rose: '#f6c6c6',
        sky: '#cfe6f0',
        sage: '#cfe2c9',
        ink: '#5c4a3a',
      },
      boxShadow: {
        sticker: '0 4px 0 rgba(92,74,58,0.12), 0 8px 20px rgba(92,74,58,0.08)',
        soft: '0 6px 24px rgba(92,74,58,0.10)',
      },
      backgroundImage: {
        paper:
          'radial-gradient(circle at 20% 10%, rgba(247,215,116,0.18), transparent 40%), radial-gradient(circle at 80% 90%, rgba(246,198,198,0.18), transparent 45%), linear-gradient(180deg, #fdfaf3 0%, #f7eed8 100%)',
      },
    },
  },
  plugins: [],
}
