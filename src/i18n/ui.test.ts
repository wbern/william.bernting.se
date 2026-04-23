import { describe, it, expect } from "vitest";
import { ui, defaultLang, languages } from "./ui";

describe("ui translations", () => {
  it("default language is sv", () => {
    expect(defaultLang).toBe("sv");
  });

  it("supports sv and en", () => {
    expect(languages).toContain("sv");
    expect(languages).toContain("en");
  });

  it("both locales have the same keys", () => {
    const svKeys = Object.keys(ui.sv).sort();
    const enKeys = Object.keys(ui.en).sort();
    expect(svKeys).toEqual(enKeys);
  });

  it("no unexpected empty values", () => {
    // These keys are intentionally empty for some locales (e.g. Swedish "Stacken." has no prefix)
    const allowEmpty = new Set([
      "skills.heading.before",
      // stat prefixes are intentionally empty when the sentence starts with the value
      "stats.users.prefix",
      "stats.experience.prefix",
      "stats.linkedin.prefix",
    ]);
    for (const lang of languages) {
      for (const [key, value] of Object.entries(ui[lang])) {
        if (allowEmpty.has(key)) continue;
        expect(value, `${lang}.${key} is empty`).not.toBe("");
      }
    }
  });

  it("sv hero greeting is Swedish", () => {
    expect(ui.sv["hero.greeting"]).toBe("Hej!");
  });

  it("en hero greeting is English", () => {
    expect(ui.en["hero.greeting"]).toBe("Hey!");
  });

  it("has meta title for both locales", () => {
    expect(ui.sv["meta.title"]).toBe("William Bernting");
    expect(ui.en["meta.title"]).toBe("William Bernting");
  });
});
