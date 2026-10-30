/* eslint-disable no-bitwise */
import { Dimensions, PixelRatio, useWindowDimensions as useRNWindowDimensions } from 'react-native';

export default function useWindowDimensions() {
  const { width, height } = useRNWindowDimensions();
  return { width, height };
}

export function adjustColorBrightness(hex: string, percent: number): string {
  let color = hex.replace("#", "");
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const getRandomId = (length = 6) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  let id = "";
  for (let i = 0; i < length; i++) {
    id += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return id;
};

export function responsiveFontSize(fontSize: number): number | string {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const pixelRatio = PixelRatio.get();
  const diagonalPixels = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
  const diagonalInches = diagonalPixels / pixelRatio / 160; // 160 dpi is roughly standard baseline in React Native

  const MOBILE_BREAKPOINT = 768;
  const TABLET_BREAKPOINT = 1024;
  const LARGE_DESKTOP_BREAKPOINT = 1920;
  const TV_BREAKPOINT = 2560;

  let scaleFactor: number = 1.3;

  if (screenWidth < MOBILE_BREAKPOINT) {
    scaleFactor = 0.85;
  } else if (screenWidth < TABLET_BREAKPOINT) {
    scaleFactor = 0.95;
  } else if (screenWidth >= TV_BREAKPOINT || diagonalInches > 30) {
    if (diagonalInches > 60) {
      scaleFactor = 1.6;
    } else if (diagonalInches > 50) {
      scaleFactor = 1.5;
    } else if (diagonalInches > 40) {
      scaleFactor = 1.4;
    } else if (diagonalInches > 30) {
      scaleFactor = 1.3;
    } else {
      scaleFactor = 1.2;
    }

    if (screenWidth >= 2560) {
      scaleFactor *= 1.1;
    }
  } else if (screenWidth >= LARGE_DESKTOP_BREAKPOINT) {
    scaleFactor = 1.15;
  } else {
    scaleFactor = 1.0;
  }
  let resFontSize = fontSize * scaleFactor;
  const minTVFont = 12;
  const maxTVFont = 72;
  const minFontSize = 8;
  if (screenWidth >= TV_BREAKPOINT || diagonalInches > 30) {
    resFontSize = Math.min(Math.max(resFontSize, minTVFont), maxTVFont);
  } else {
    resFontSize = Math.max(resFontSize, minFontSize);
  }

  return resFontSize;
}

export function hexToRgba(hex: string, alpha: number): string {
  let color = hex.replace("#", "");
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  // Drop a trailing alpha channel if one was supplied (e.g. "#00a8f7ff").
  if (color.length === 8) {
    color = color.slice(0, 6);
  }
  const num = parseInt(color, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
