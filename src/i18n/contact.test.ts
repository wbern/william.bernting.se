import { describe, it, expect } from "vitest";
import {
  CONTACT,
  buildMailto,
  getTestimonials,
  getTracks,
  testimonials,
  trackEntries,
} from "./contact";

describe("buildMailto", () => {
  it("returns a bare mailto without a subject", () => {
    expect(buildMailto("a@b.se")).toBe("mailto:a@b.se");
  });

  it("URL-encodes the subject, including Swedish characters", () => {
    expect(buildMailto("a@b.se", "Spår: Legacy")).toBe(
      "mailto:a@b.se?subject=Sp%C3%A5r%3A%20Legacy",
    );
  });
});

describe("tracks", () => {
  it("has the three tracks in a fixed order", () => {
    expect(trackEntries.map((t) => t.id)).toEqual(["teach", "legacy", "build"]);
  });

  it("has non-empty copy for every field in both locales", () => {
    for (const entry of trackEntries) {
      for (const lang of ["sv", "en"] as const) {
        for (const [key, value] of Object.entries(entry[lang])) {
          expect(value, `${entry.id}.${lang}.${key}`).not.toBe("");
        }
      }
    }
  });

  it("builds a per-track mailto to the public address", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const track of getTracks(lang)) {
        expect(track.href.startsWith(`mailto:${CONTACT.email}?subject=`)).toBe(true);
        expect(decodeURIComponent(track.href.split("subject=")[1])).toBe(track.subject);
      }
    }
  });
});

describe("testimonials", () => {
  it("every testimonial has a relation in both locales", () => {
    for (const t of testimonials) {
      expect(t.relation.sv).not.toBe("");
      expect(t.relation.en).not.toBe("");
    }
  });

  it("sv leads with the Swedish recommendation", () => {
    const sv = getTestimonials("sv");
    expect(sv[0].lang).toBe("sv");
    expect(sv).toHaveLength(testimonials.length);
  });

  it("en only shows English recommendations (no silent translation)", () => {
    const en = getTestimonials("en");
    expect(en.length).toBeGreaterThan(0);
    expect(en.every((t) => t.lang === "en")).toBe(true);
  });
});
