import { describe, it, expect } from "vitest";
import { useTranslations, getLangFromUrl, getHreflangUrls } from "./utils";

describe("useTranslations", () => {
  it("returns Swedish translation for sv", () => {
    const t = useTranslations("sv");
    expect(t("hero.greeting")).toBe("Hej!");
  });

  it("returns English translation for en", () => {
    const t = useTranslations("en");
    expect(t("hero.greeting")).toBe("Hey!");
  });
});

describe("getLangFromUrl", () => {
  it("returns sv for root path", () => {
    expect(getLangFromUrl(new URL("https://example.com/"))).toBe("sv");
  });

  it("returns en for /en/ path", () => {
    expect(getLangFromUrl(new URL("https://example.com/en/"))).toBe("en");
  });

  it("returns sv for unknown path segment", () => {
    expect(getLangFromUrl(new URL("https://example.com/fr/about"))).toBe("sv");
  });
});

describe("getHreflangUrls", () => {
  it("generates correct URLs from Swedish homepage", () => {
    const result = getHreflangUrls(
      new URL("https://william.bernting.se/"),
      "sv",
    );
    expect(result).toEqual({
      sv: "https://william.bernting.se/",
      en: "https://william.bernting.se/en/",
      "x-default": "https://william.bernting.se/",
    });
  });

  it("generates correct URLs from English homepage", () => {
    const result = getHreflangUrls(
      new URL("https://william.bernting.se/en/"),
      "en",
    );
    expect(result).toEqual({
      sv: "https://william.bernting.se/",
      en: "https://william.bernting.se/en/",
      "x-default": "https://william.bernting.se/",
    });
  });
});
