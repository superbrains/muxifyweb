import { createSystem, defaultConfig } from "@chakra-ui/react";

export const chakraTheme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        primary: {
          50: { value: "#fff9f8" },
          100: { value: "#fff4f4" },
          200: { value: "#ffecec" },
          500: { value: "#f94444" },
          600: { value: "#e03e3e" },
          700: { value: "#c73838" },
        },
        grey: {
          500: { value: "#333333" },
        },
        red: {
          50: { value: "#fff9f8" },
          100: { value: "#fff4f4" },
          200: { value: "#ffecec" },
        },
      },
    },
  },
});
