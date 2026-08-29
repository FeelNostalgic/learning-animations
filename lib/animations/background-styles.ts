import React from "react"
import type { AnimationBackground } from "@/types/universal-animation"

/**
 * Computes React inline CSS styles for a given AnimationBackground.
 */
export function getBackgroundInlineStyle(
  bg?: AnimationBackground,
  theme: "light" | "dark" = "dark"
): React.CSSProperties {
  if (!bg) {
    return {}
  }

  const style: React.CSSProperties = {}

  // 1. Solid Color
  if (bg.type === "solid" && bg.color) {
    style.backgroundColor = bg.color
  }

  // 2. Linear or Radial Gradient
  if (bg.type === "gradient" && bg.gradient) {
    const { from, to, direction = "to-r" } = bg.gradient
    if (direction === "radial") {
      style.backgroundImage = `radial-gradient(circle at center, ${from}, ${to})`
    } else {
      const dirMap: Record<string, string> = {
        "to-r": "to right",
        "to-b": "to bottom",
        "to-br": "to bottom right",
      }
      style.backgroundImage = `linear-gradient(${dirMap[direction] || "to right"}, ${from}, ${to})`
    }
  }

  // 3. Background Image
  if (bg.type === "image" && bg.imageUrl) {
    style.backgroundImage = `url("${bg.imageUrl}")`
    style.backgroundPosition = "center center"

    if (bg.imageFit === "cover") {
      style.backgroundSize = "cover"
      style.backgroundRepeat = "no-repeat"
    } else if (bg.imageFit === "contain") {
      style.backgroundSize = "contain"
      style.backgroundRepeat = "no-repeat"
    } else if (bg.imageFit === "repeat") {
      style.backgroundRepeat = "repeat"
      style.backgroundSize = "auto"
    } else {
      style.backgroundSize = "cover"
      style.backgroundRepeat = "no-repeat"
    }

    if (bg.color) {
      style.backgroundColor = bg.color
    }
  }

  return style
}

/**
 * Renders decorative overlay pattern (dots, grid, cross) if requested.
 */
export function getPatternSvgPattern(pattern?: "none" | "grid" | "dots" | "cross", isDark = true) {
  if (!pattern || pattern === "none") return null

  const strokeColor = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.05)"

  if (pattern === "dots") {
    return `radial-gradient(circle at 2px 2px, ${strokeColor} 1.5px, transparent 0)`
  }

  if (pattern === "grid") {
    return `linear-gradient(to right, ${strokeColor} 1px, transparent 1px), linear-gradient(to bottom, ${strokeColor} 1px, transparent 1px)`
  }

  return null
}
