import { createSystem, defaultConfig } from "@chakra-ui/react";

export const chakraTheme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        primary: {
          25: { value: "#FFF9F8" },
          50: { value: "#fff9f8" },
          70: { value: "#FFF3F3" },
          100: { value: "#fff4f4" },
          200: { value: "#ffecec" },
          500: { value: "#f94444" },
          600: { value: "#e03e3e" },
          700: { value: "#c73838" },
        },
        gray: {
          blue: {
            100: { value: "#FAFBFC" },
            200: { value: "#C3D3E2" },
            300: { value: "#9cb1c5" },
            500: { value: "#333333" },
            700: { value: "#737791" },
            800: { value: "#0F3659" },
            900: { value: "#7B91B0" },
          },
        },
        red: {
          50: { value: "#fff9f8" },
          100: { value: "#fff4f4" },
          200: { value: "#ffecec" },
          300: { value: "#FFD0D0" },
          400: { value: "#FFEFEF" },
        },
        dark: {
          500: { value: "#292D32" },
        },
      },
    },
  },
});
