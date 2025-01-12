import {describe, expect, it} from "vitest"
import {createUtils} from "../src";

const nums = [0, 1, 2, 3]
const uuids = ["00000000-0000-0000-0000-000000000000", "00000000-0000-0000-0000-000000000001", "00000000-0000-0000-0000-000000000002", "00000000-0000-0000-0000-000000000003"]

describe("sequentialValue", () => {
    it("creates sequential values", () => {
        const utils = createUtils()

        nums.forEach(c => {
            expect(utils.sequentialValue()).toBe(c)
        })
    })

    it("creates sequential values with categories", () => {
        const utils = createUtils()

        nums.forEach(c => {
            expect(utils.sequentialValue("cat1")).toBe(c)
            expect(utils.sequentialValue("cat2")).toBe(c)
        })
    })
})

describe("sequentialUuid", () => {
    it("creates sequential uuids", () => {
        const utils = createUtils()

        uuids.forEach(c => {
            expect(utils.sequentialUuid()).toBe(c)
        })
    })

    it("creates sequential uuids with categories", () => {
        const utils = createUtils()

        uuids.forEach(c => {
            expect(utils.sequentialUuid("cat1")).toBe(c)
            expect(utils.sequentialUuid("cat2")).toBe(c)
        })
    })
})
