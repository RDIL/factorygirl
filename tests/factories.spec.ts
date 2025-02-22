import {describe, expect, it} from "vitest";
import {factory} from "../src";

const noop = () => {
}

interface User {
    id: string
    name: string
    role: 'user' | 'admin'
    isActive: boolean
    createdAt: Date
}

interface Book {
    id: string
    title: string
    author: string
    genre: string
    isCheckedOut: boolean
}

describe("factory defaults", () => {
    it("can create a basic object from the default", () => {
        const myFactory = factory<{ name: string }, "">(
            () => ({
                name: "jeff",
            }),
            noop
        )

        expect(myFactory().name).toEqual("jeff")
    })

    it("can use utils in the default", () => {
        const myFactory = factory<{ name: string }, "">(
            (utils) => ({
                name: `jeff-${utils.sequentialValue()}`,
            }),
            noop
        )

        expect(myFactory().name).toEqual("jeff-0")
        expect(myFactory().name).toEqual("jeff-1")
        expect(myFactory().name).toEqual("jeff-2")
    })

    it("can have an inline default", () => {
        const myFactory = factory<{ name: string }, "">(
            {name: "hi"},
            noop
        )

        expect(myFactory().name).toEqual("hi")
        expect(myFactory().name).toEqual("hi")
    })
})

describe("factories", () => {
    it("should allow overrides of base values", () => {
        const createUser = factory<User, never>((utils) => ({
            id: utils.sequentialUuid("user"),
            name: "John Doe",
            role: "user",
            isActive: true,
            createdAt: new Date("2024-01-01")
        }))

        const user = createUser({name: "Jane Doe", role: "admin"})
        expect(user).toEqual({
            id: expect.any(String),
            name: "Jane Doe",
            role: "admin",
            isActive: true,
            createdAt: new Date("2024-01-01")
        })
    })
})

it("customizer is optional", () => {
    const myFactory = factory<{ name: string }, "">({name: "hi"})

    expect(myFactory().name).toEqual("hi")
})

describe("traits", () => {
    it("can have a basic trait (inline)", () => {
        const myFactory = factory<{ name: string, role: string }, "admin">(
            (utils) => ({
                name: `jeff-${utils.sequentialValue()}`,
                role: "user",
            }),
            ({trait}) => {
                trait("admin", {
                    role: "admin",
                })
            }
        )

        expect(myFactory().role).toEqual("user")
        expect(myFactory({}, ["admin"]).role).toEqual("admin")
    })

    it("can use utils in a trait", () => {
        const myFactory = factory<{ name: string, role: string }, "admin">(
            (utils) => ({
                name: `jeff-${utils.sequentialValue("name")}`,
                role: "user",
            }),
            ({trait}) => {
                trait("admin", (_, utils) => ({
                    role: `admin-number-${utils.sequentialValue()}`,
                }))
            }
        )

        expect(myFactory().role).toEqual("user")
        expect(myFactory({}, ["admin"]).role).toEqual("admin-number-0")
        expect(myFactory({}, ["admin"]).role).toEqual("admin-number-1")
    })

    it("can merge in a new property that isn't already there", () => {
        const myFactory = factory<{ name: string, role: string, nickname?: string }, "aka">(
            (utils) => ({
                name: `jeff-${utils.sequentialValue("name")}`,
                role: "user",
            }),
            ({trait}) => {
                trait("aka", {
                    nickname: "jeffy"
                })
            }
        )

        expect(myFactory().nickname).toBeUndefined()
        expect(myFactory({}, ["aka"]).nickname).toEqual("jeffy")
    })
})