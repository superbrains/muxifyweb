// Removed "use client" - not needed in Vite/React
/* eslint-disable react-refresh/only-export-components */
// Fast refresh warnings are acceptable here - hooks and components are intentionally co-located

import type { SpanProps } from "@chakra-ui/react"
import { Span } from "@chakra-ui/react"
// import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
// import { LuMoon, LuSun } from "react-icons/lu"

export interface ColorModeProviderProps extends Omit<ThemeProviderProps, "forcedTheme"> {
  forcedTheme?: never // Disable forcedTheme to prevent dark mode
}

export function ColorModeProvider(props: ColorModeProviderProps) {
  // Force light mode only
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      forcedTheme="light"
      {...props}
    />
  )
}

// Light mode only - dark mode commented out
export type ColorMode = "light"
// export type ColorMode = "light" | "dark" | "system" // Dark mode disabled

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  // Always return light mode
  const { setTheme } = useTheme()
  const colorMode: ColorMode = "light"

  const toggleColorMode = () => {
    // No-op: dark mode disabled
    // setTheme(resolvedTheme === "dark" ? "dark" : "light")
  }

  const setColorMode = (mode: ColorMode) => {
    // Only allow light mode
    if (mode === "light") {
      setTheme("light")
    }
    // Ignore dark mode requests
  }

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T) {
  // Always return light value (dark mode disabled)
  // const { colorMode } = useColorMode()
  // return colorMode === "dark" ? dark : light
  return light
}

// Dark mode components commented out
// export function ColorModeIcon() {
//   const { colorMode } = useColorMode()
//   return colorMode === "dark" ? <LuMoon /> : <LuSun />
// }

// interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

// export const ColorModeButton = React.forwardRef<
//   HTMLButtonElement,
//   ColorModeButtonProps
// >(function ColorModeButton(props, ref) {
//   const { toggleColorMode } = useColorMode()
//   return (
//     <ClientOnly fallback={<Skeleton boxSize="9" />}>
//       <IconButton
//         onClick={toggleColorMode}
//         variant="ghost"
//         aria-label="Toggle color mode"
//         size="sm"
//         ref={ref}
//         {...props}
//         css={{
//           _icon: {
//             width: "5",
//             height: "5",
//           },
//         }}
//       >
//         <ColorModeIcon />
//       </IconButton>
//     </ClientOnly>
//   )
// })

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

// Dark mode component commented out
// export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
//   function DarkMode(props, ref) {
//     return (
//       <Span
//         color="fg"
//         display="contents"
//         className="chakra-theme dark"
//         colorPalette="gray"
//         colorScheme="dark"
//         ref={ref}
//         {...props}
//       />
//     )
//   },
// )
