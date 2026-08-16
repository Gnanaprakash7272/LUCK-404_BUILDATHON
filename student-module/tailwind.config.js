/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  theme: {
    extend: {
      colors: {
        // ─────────────────────────────────────────────
        // TEXT
        // ─────────────────────────────────────────────
        ink: {
          DEFAULT: '#0F172A',
          soft: '#475569',
          faint: '#64748B',
          muted: '#94A3B8',
        },

        // ─────────────────────────────────────────────
        // SURFACES
        // ─────────────────────────────────────────────
        surface: {
          DEFAULT: '#FFFFFF',
          sunk: '#F8FAFC',
          subtle: '#F1F5F9',
          border: '#E2E8F0',
          strongBorder: '#CBD5E1',
        },

        // ─────────────────────────────────────────────
        // PRIMARY BRAND
        // ─────────────────────────────────────────────
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
        },

        // ─────────────────────────────────────────────
        // AI / INTELLIGENCE
        // ─────────────────────────────────────────────
        accent: {
          DEFAULT: '#6366F1',
          light: '#EEF2FF',
          soft: '#E0E7FF',
          dark: '#4F46E5',
        },

        // ─────────────────────────────────────────────
        // RISK STATES
        // ─────────────────────────────────────────────
        risk: {
          low: '#16A34A',
          lowBg: '#DCFCE7',
          lowSoft: '#F0FDF4',

          medium: '#D97706',
          mediumBg: '#FEF3C7',
          mediumSoft: '#FFFBEB',

          high: '#DC2626',
          highBg: '#FEE2E2',
          highSoft: '#FEF2F2',
        },

        // ─────────────────────────────────────────────
        // CHART COLORS
        // ─────────────────────────────────────────────
        chart: {
          blue: '#2563EB',
          indigo: '#6366F1',
          green: '#16A34A',
          amber: '#D97706',
          red: '#DC2626',
          slate: '#64748B',
        },
      },

      // ─────────────────────────────────────────────
      // TYPOGRAPHY
      // ─────────────────────────────────────────────
      fontFamily: {
        display: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],

        body: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],

        mono: [
          'IBM Plex Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },

      // ─────────────────────────────────────────────
      // SHADOWS
      // ─────────────────────────────────────────────
      boxShadow: {
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',

        card:
          '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',

        cardHover:
          '0 10px 25px -8px rgba(15, 23, 42, 0.10), 0 4px 10px -4px rgba(15, 23, 42, 0.06)',

        elevated:
          '0 12px 32px -12px rgba(15, 23, 42, 0.16)',

        ai:
          '0 10px 30px -12px rgba(99, 102, 241, 0.22)',
      },

      // ─────────────────────────────────────────────
      // BORDER RADIUS
      // ─────────────────────────────────────────────
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        card: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      // ─────────────────────────────────────────────
      // ANIMATIONS
      // ─────────────────────────────────────────────
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
    },
  },

  plugins: [],
}