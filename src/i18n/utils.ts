import { ui, defaultLang, type Lang } from "./ui";

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split("/");
  if (segment in ui) return segment as Lang;
  return defaultLang;
}

export function getHreflangUrls(
  url: URL,
  currentLang: Lang,
): { sv: string; en: string; "x-default": string } {
  const origin = url.origin;
  const pathname = url.pathname;

  const svPath =
    currentLang === "en" ? pathname.replace(/^\/en\/?/, "/") || "/" : pathname;

  const enPath =
    currentLang === "sv"
      ? svPath === "/"
        ? "/en/"
        : `/en${svPath}`
      : pathname;

  return {
    sv: `${origin}${svPath}`,
    en: `${origin}${enPath}`,
    "x-default": `${origin}${svPath}`,
  };
}
