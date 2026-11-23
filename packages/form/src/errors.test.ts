import { describe, expect, it } from "vite-plus/test";

import { toErrorMessages } from "./errors";

describe("toErrorMessages", () => {
  it("keeps strings", () => {
    expect(toErrorMessages(["Required"])).toEqual(["Required"]);
  });

  it("reads Standard Schema issues", () => {
    expect(toErrorMessages([{ message: "Too short", path: ["name"] }])).toEqual(["Too short"]);
  });

  it("flattens nested arrays", () => {
    expect(toErrorMessages([["A", [{ message: "B" }]], "C"])).toEqual(["A", "B", "C"]);
  });

  it("reads a form-level error object that TanStack left wrapped", () => {
    expect(toErrorMessages([{ form: "Server is down" }])).toEqual(["Server is down"]);
  });

  it("drops duplicates, empty values and things that are not messages", () => {
    expect(toErrorMessages(["A", "A", "", null, undefined, 4, {}, { message: "" }])).toEqual(["A"]);
  });
});
