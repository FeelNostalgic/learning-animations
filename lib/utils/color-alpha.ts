/**
 * Converts a 6-character hex color code and alpha into an rgba CSS string.
 */
export function hexToRgba(hex: string, alpha: number): string {
  if (alpha <= 0) return "transparent"
  const cleanHex = hex.replace("#", "")

  let r = 0,
    g = 0,
    b = 0

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.slice(0, 2), 16)
    g = parseInt(cleanHex.slice(2, 4), 16)
    b = parseInt(cleanHex.slice(4, 6), 16)
  }

  const a = Math.max(0, Math.min(1, +alpha.toFixed(2)))
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/**
 * Converts an RGB tuple into a lowercase hex string.
 */
export function rgbaToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Parses any color string (hex, rgba, transparent) into base hex and alpha (0 to 1).
 */
export function parseColorAlpha(color?: string): {
  hex: string
  alpha: number
  isTransparent: boolean
} {
  if (!color || color === "transparent" || color === "none") {
    return { hex: "#000000", alpha: 0, isTransparent: true }
  }

  if (color.startsWith("rgba")) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (match) {
      const r = parseInt(match[1], 10)
      const g = parseInt(match[2], 10)
      const b = parseInt(match[3], 10)
      const a = match[4] !== undefined ? parseFloat(match[4]) : 1
      return {
        hex: rgbaToHex(r, g, b),
        alpha: a,
        isTransparent: a <= 0,
      }
    }
  }

  if (color.startsWith("#")) {
    return {
      hex: color.slice(0, 7),
      alpha: 1,
      isTransparent: false,
    }
  }

  return { hex: "#0070f3", alpha: 1, isTransparent: false }
}
