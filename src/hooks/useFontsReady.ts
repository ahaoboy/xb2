import { useEffect, useReducer } from "react";

/**
 * Returns a version counter that increments once after all web fonts finish
 * loading. Layout code that measures text with a canvas can depend on this
 * value so it re-measures with the final fonts (canvas measurement made
 * before fonts load uses fallback fonts and may be too narrow).
 */
export function useFontsReady(): number {
  const [version, force] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    let mounted = true;
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (fonts?.ready) {
      fonts.ready.then(() => {
        if (mounted) force();
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  return version;
}
