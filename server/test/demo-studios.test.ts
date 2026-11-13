import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_HOSTS, DEMO_STUDIOS } from "../src/data/demo-studios.js";

const REQUIRED_CATEGORIES = [
  "photography",
  "film",
  "podcast",
  "music",
] as const;

test("demo catalog contains 24 unique published studios", () => {
  assert.equal(DEMO_STUDIOS.length, 24);
  assert.equal(new Set(DEMO_STUDIOS.map((studio) => studio._id)).size, 24);
  assert.equal(new Set(DEMO_STUDIOS.map((studio) => studio.slug)).size, 24);
  assert.equal(new Set(DEMO_STUDIOS.map((studio) => studio.title)).size, 24);
  assert.equal(
    new Set(DEMO_STUDIOS.map((studio) => studio.description)).size,
    24
  );

  for (const studio of DEMO_STUDIOS) {
    assert.match(studio._id, /^[0-9a-f]{24}$/);
    assert.equal(studio.status, "published");
    assert.ok(studio.pricePerHour > 0);
    assert.ok(Number.isInteger(studio.capacity) && studio.capacity > 0);
    assert.ok(studio.features.length >= 4);
  }
});

test("demo catalog has six studios in each required category", () => {
  for (const category of REQUIRED_CATEGORIES) {
    const studios = DEMO_STUDIOS.filter(
      (studio) => studio.category === category
    );

    assert.equal(
      studios.length,
      6,
      `expected six ${category} studios, found ${studios.length}`
    );
  }
});

test("every studio has a unique multi-image gallery", () => {
  const imageOwners = new Map<string, string>();

  for (const studio of DEMO_STUDIOS) {
    assert.ok(
      studio.images.length >= 2,
      `${studio.title} needs at least two gallery images`
    );

    for (const image of studio.images) {
      assert.match(image, /^https:\/\//);

      const owner = imageOwners.get(image);
      assert.equal(
        owner,
        undefined,
        `${image} is shared by ${owner ?? "another studio"} and ${studio.slug}`
      );
      imageOwners.set(image, studio.slug);
    }
  }
});

test("every studio references one of the seeded hosts", () => {
  const hostsByEmail = new Map(
    DEMO_HOSTS.map((host) => [host.email, host])
  );

  assert.equal(new Set(DEMO_HOSTS.map((host) => host._id)).size, 24);
  assert.equal(new Set(DEMO_HOSTS.map((host) => host.email)).size, 24);
  assert.equal(new Set(DEMO_STUDIOS.map((studio) => studio.hostEmail)).size, 24);

  for (const studio of DEMO_STUDIOS) {
    const host = hostsByEmail.get(studio.hostEmail);

    assert.ok(host, `${studio.title} has no matching host`);
    assert.match(host._id, /^[0-9a-f]{24}$/);
    assert.ok(host.name.trim().length > 0);
    assert.match(host.avatar, /^https:\/\//);
  }
});

test("every studio has valid booking terms", () => {
  for (const studio of DEMO_STUDIOS) {
    const terms = studio.booking;

    assert.ok(Number.isInteger(terms.minimumHours));
    assert.ok(terms.minimumHours >= 1);
    assert.ok(
      terms.maximumHours === undefined ||
        (Number.isInteger(terms.maximumHours) &&
          terms.maximumHours >= terms.minimumHours)
    );
    assert.ok(Number.isInteger(terms.leadTimeDays));
    assert.ok(terms.leadTimeDays >= 0);
    assert.ok(Number.isInteger(terms.depositPercentage));
    assert.ok(terms.depositPercentage >= 0 && terms.depositPercentage <= 100);
    assert.ok(terms.cancellationPolicy.trim().length > 0);
    assert.ok(terms.availability.trim().length > 0);
    assert.equal(typeof terms.instantBook, "boolean");
  }
});
