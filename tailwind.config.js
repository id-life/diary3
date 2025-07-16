const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}', './src/hook/**/*.{ts,tsx}'],
  theme: {
    extend: {
      container: {
        center: true,
      },
      screens: {
        xs: { max: '480px' },
        sm: { max: '640px' },
        md: { max: '768px' },
        lg: { min: '769px', max: '1024px' },
        xl: { min: '1025px', max: '1365px' },
        '2xl': '1366px',
        '4xl': '1920px',
        // Mobile-first responsive design
        mobile: { max: '767px' },
        tablet: { min: '768px', max: '1023px' },
        desktop: { min: '1024px' },
      },
      colors: {
        diary: {
          primary: '#376BED',
          danger: '#dc2626',
          dialog: '#282828',
          'dialog-mask': '000000CC',
          // Primary colors
          navy: '#1e1b39',
          'navy-light': '#2d2a4a',
        },
        gray: {
          DEFAULT: '#BBBAC3',
        },
        purple: '#6865FF',
        blue: '#376BED',
        'gradient-home-from': 'var(--gradient-home-from)',
        // shadcn
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      backgroundImage: {
        gradient: 'var(--gradient)',
        'gradient-1': 'repeating-linear-gradient(to right, var(--gradient-1-from), var(--gradient-1-to))',
        'gradient-2': 'repeating-linear-gradient(to right, var(--gradient-2-from), var(--gradient-2-to))',
        'gradient-3': 'repeating-linear-gradient(to right, var(--gradient-3-from), var(--gradient-3-to))',
        'gradient-4': 'repeating-linear-gradient(to right, var(--gradient-4-from), var(--gradient-4-to))',
        'gradient-home': 'var(--gradient-home)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        DDin: ['D-DIN'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Component specific radius
        'login-input': '10px',
        'login-button': '10px',
        card: '8px',
        tag: '4px',
        button: '6px',
      },
      lineHeight: {
        3.5: '.875rem',
      },
      spacing: {
        // Custom spacing values
        14: '3.5rem', // 56px for input height
        15: '3.75rem', // 60px
        18: '4.5rem', // 72px
        22: '5.5rem', // 88px
        26: '6.5rem', // 104px
        30: '7.5rem', // 120px
        35: '8.75rem', // 140px for social icon gap
        // Progress bar specific
        'progress-height': '8px',
        'progress-mark': '14px',
        // Card specific
        'card-padding': '12px',
        'card-gap': '8px',
      },
      fontSize: {
        '2xs': '10px',
        '3xs': '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        button: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
