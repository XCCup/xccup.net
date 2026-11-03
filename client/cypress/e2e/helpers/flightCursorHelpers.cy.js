import { findNearestFixIndex } from "../../../src/helper/flightCursorHelpers";

describe("flight cursor timestamp lookup", () => {
  const sparseFixes = [
    { timestamp: 1000 },
    { timestamp: 5000 },
    { timestamp: 11000 },
  ];

  it("selects the nearest fix while clamping track boundaries", () => {
    expect(findNearestFixIndex(sparseFixes, 0)).to.equal(0);
    expect(findNearestFixIndex(sparseFixes, 1000)).to.equal(0);
    expect(findNearestFixIndex(sparseFixes, 3000)).to.equal(0);
    expect(findNearestFixIndex(sparseFixes, 3001)).to.equal(1);
    expect(findNearestFixIndex(sparseFixes, 9000)).to.equal(2);
    expect(findNearestFixIndex(sparseFixes, 20000)).to.equal(2);
  });

  it("handles empty tracks", () => {
    expect(findNearestFixIndex([], 1000)).to.equal(-1);
  });
});
