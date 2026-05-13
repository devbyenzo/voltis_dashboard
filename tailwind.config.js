export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#08101c',
        panel: 'rgba(15, 19, 28, 0.96)',
        glow: '#62ff9d',
        accent: '#76ffae',
        text: '#edf7ff',
        muted: '#7f9db5',
      },
      boxShadow: {
        neon: '0 25px 80px rgba(30, 255, 145, 0.18)',
        soft: '0 20px 55px rgba(0, 0, 0, 0.24)',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}
