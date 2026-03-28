import { describe, it, expect } from "vitest";
import {
  getCvProfile,
  getCvJobs,
  getCvEducation,
  getCvLanguages,
  getCvBooks,
  getCvSkills,
  getCvTraits,
  getCvAcknowledgement,
  getCvCommunity,
  getCvQuote,
} from "./cv";

describe("cv data", () => {
  it("has 8 jobs for each locale", () => {
    expect(getCvJobs("sv")).toHaveLength(8);
    expect(getCvJobs("en")).toHaveLength(8);
  });

  it("both locales have profile with name and contacts", () => {
    for (const lang of ["sv", "en"] as const) {
      const profile = getCvProfile(lang);
      expect(profile.name).toBe("William Bernting");
      expect(profile.contacts.length).toBeGreaterThan(0);
      expect(profile.subtitle).toBeTruthy();
      expect(profile.intro.length).toBeGreaterThan(0);
    }
  });

  it("jobs have required fields (no empty titles or companies)", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const job of getCvJobs(lang)) {
        expect(job.title).toBeTruthy();
        expect(job.company).toBeTruthy();
        expect(job.dateRange).toBeTruthy();
        expect(job.location).toBeTruthy();
        expect(job.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(job.w).toBeGreaterThanOrEqual(0);
        expect(job.w).toBeLessThanOrEqual(100);
      }
    }
  });

  it("each job maps to the correct timeline color", () => {
    const jobs = getCvJobs("en");
    // Telia Lead and Telia Senior now have distinct colors (separate blocks)
    expect(jobs[4].color).not.toBe(jobs[5].color);
    // KITS and HPE should have distinct colors
    expect(jobs[6].color).not.toBe(jobs[4].color); // KITS ≠ Telia Lead
    expect(jobs[7].color).not.toBe(jobs[6].color); // HPE ≠ KITS
    // HPE is the last entry and should be yellow
    expect(jobs[7].color).toBe("#e8e040");
  });

  it("jobs with bullets have no empty bullets", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const job of getCvJobs(lang)) {
        for (const bullet of job.bullets) {
          expect(bullet.trim()).toBeTruthy();
        }
      }
    }
  });

  it("has education for each locale", () => {
    expect(getCvEducation("sv").length).toBeGreaterThan(0);
    expect(getCvEducation("en").length).toBeGreaterThan(0);
  });

  it("has 4 languages for each locale", () => {
    expect(getCvLanguages("sv")).toHaveLength(4);
    expect(getCvLanguages("en")).toHaveLength(4);
  });

  it("language levels are between 1 and 5", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const l of getCvLanguages(lang)) {
        expect(l.level).toBeGreaterThanOrEqual(1);
        expect(l.level).toBeLessThanOrEqual(5);
        expect(l.name).toBeTruthy();
        expect(l.proficiency).toBeTruthy();
      }
    }
  });

  it("has 2 books", () => {
    expect(getCvBooks()).toHaveLength(2);
    for (const book of getCvBooks()) {
      expect(book.title).toBeTruthy();
      expect(book.author).toBeTruthy();
    }
  });

  it("has 12 skills", () => {
    expect(getCvSkills()).toHaveLength(12);
    for (const skill of getCvSkills()) {
      expect(skill.trim()).toBeTruthy();
    }
  });

  it("has 3 traits for each locale", () => {
    expect(getCvTraits("sv")).toHaveLength(3);
    expect(getCvTraits("en")).toHaveLength(3);
    for (const lang of ["sv", "en"] as const) {
      for (const trait of getCvTraits(lang)) {
        expect(trait.name).toBeTruthy();
        expect(trait.description).toBeTruthy();
      }
    }
  });

  it("has acknowledgement for each locale", () => {
    for (const lang of ["sv", "en"] as const) {
      const ack = getCvAcknowledgement(lang);
      expect(ack.title).toBeTruthy();
      expect(ack.description).toBeTruthy();
    }
  });

  it("has community entries for each locale", () => {
    expect(getCvCommunity("sv").length).toBeGreaterThan(0);
    expect(getCvCommunity("en").length).toBeGreaterThan(0);
  });

  it("has quote for each locale", () => {
    for (const lang of ["sv", "en"] as const) {
      const quote = getCvQuote(lang);
      expect(quote.text).toBeTruthy();
      expect(quote.author).toBeTruthy();
    }
  });
});
