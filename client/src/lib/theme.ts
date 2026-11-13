/**
 * Shared theme constants.
 *
 * The theme is stored as a `data-theme` attribute on <html> so CSS tokens can
 * switch without a provider. The inline script runs before first paint to
 * prevent a light/dark flash on refresh.
 */
export const THEME_STORAGE_KEY = "studiospace-theme";

export const DEFAULT_THEME = "dark" as const;

export const THEME_INIT_SCRIPT = `(function(){try{var key="${THEME_STORAGE_KEY}";var stored=window.localStorage.getItem(key);var theme=stored==="light"?"light":"dark";var root=document.documentElement;root.setAttribute("data-theme",theme);root.style.colorScheme=theme;}catch(error){var root=document.documentElement;root.setAttribute("data-theme","dark");root.style.colorScheme="dark";}})();`;
