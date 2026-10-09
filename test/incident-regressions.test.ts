import { expect, it } from "vitest";
import { approvedCivilDay, isPastDeadline } from "../src/deadlines.ts";
import { createApp } from "../src/app.ts";
import { openDatabase } from "../src/db.ts";
import { seedIncident } from "../src/seed.ts";

it("keeps the last millisecond of the civil deadline and expires at midnight", () => {
  expect(isPastDeadline("2026-03-13T02:59:59.999Z", "2026-03-12")).toBe(false);
  expect(isPastDeadline("2026-03-13T03:00:00.000Z", "2026-03-12")).toBe(true);
  expect(approvedCivilDay("2026-03-12T22:02:00-03:00")).toBe("2026-03-12");
});

it("deduplicates the invisible suffix from the second incident, including mixed whitespace", async () => {
  const db = openDatabase(":memory:");
  seedIncident(db);
  const app = createApp(db);
  for (const key of ["pay_7c1", "pay_7c1\u200B", " PAY_7C1\u200B \t"]) {
    const res = await app.request("/approvals", { method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({mission_id:"msn_2044", approved_at:"2026-03-12T21:05:00.000Z", idempotency_key:key}) });
    expect(res.status).toBeLessThan(300);
  }
  const body = await (await app.request("/missions/msn_2044")).json();
  expect(body.ledger).toHaveLength(1);
  expect(body.ledger[0].amount_brl).toBe(80);
  db.close();
});
