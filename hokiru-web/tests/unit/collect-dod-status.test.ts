import { describe, expect, it } from "vitest";
import { parseDod } from "../../scripts/collect-dod-status";

const SAMPLE_DOD = `# DoD

## Category A

- [x] done item
- [ ] pending item
- [ ] blocked item (needs-decision: someone)

## Category B

- [ ] 判断待ちの項目
- [X] uppercase-x done item
`;

describe("parseDod", () => {
  const items = parseDod(SAMPLE_DOD);

  it("extracts all checkbox items with their category", () => {
    expect(items).toHaveLength(5);
    expect(items[0]).toMatchObject({ category: "Category A", text: "done item", done: true });
    expect(items[4]).toMatchObject({ category: "Category B", text: "uppercase-x done item", done: true });
  });

  it("treats both lowercase and uppercase X as done", () => {
    const done = items.filter((i) => i.done);
    expect(done.map((i) => i.text)).toEqual(["done item", "uppercase-x done item"]);
  });

  it("flags English 'needs-decision' markers", () => {
    const item = items.find((i) => i.text.includes("blocked item"));
    expect(item?.needsDecision).toBe(true);
  });

  it("flags Japanese 判断待ち markers", () => {
    const item = items.find((i) => i.text === "判断待ちの項目");
    expect(item?.needsDecision).toBe(true);
  });

  it("does not flag ordinary pending items as needing a decision", () => {
    const item = items.find((i) => i.text === "pending item");
    expect(item?.needsDecision).toBe(false);
  });
});
