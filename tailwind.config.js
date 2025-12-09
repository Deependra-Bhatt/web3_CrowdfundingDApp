// tailwind.config.js
export default {
  darkMode: "class",
  theme: {
    extend: {
      // 1. Define the Keyframes
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "wiggle-once": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-1deg)" },
          "75%": { transform: "rotate(1deg)" },
        },
      },
      // 2. Map the Keyframes to Animation Utilities
      animation: {
        // General use
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-fast": "fade-in 0.3s ease-out forwards",

        // Directional
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
        "fade-in-down": "fade-in-down 0.7s ease-out forwards",

        // Specific effects
        "spin-slow": "spin 2s linear infinite", // Spin is a built-in Tailwind keyframe
        "wiggle-once": "wiggle-once 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
