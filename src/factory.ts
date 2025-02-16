import {toMerged} from "es-toolkit"
import {createUtils, Utils} from "./utils"

/** A function that takes in the current factory value, and the utils object, and returns any changes to be merged in to the value. */
export type TraitModification<FactoryType> = (value: FactoryType, utils: Utils) => Partial<FactoryType>

/** Either a {@link TraitModification} or a value to merge back into the factory output. */
export type TraitFuncOrInlineMod<FactoryType> = TraitModification<FactoryType> | Partial<FactoryType>

/** The parameters object passed to the callback given to {@link factory}. */
export type FactorySetupParams<T, TraitName extends string> = {
    /**
     * Defines a new named trait. Traits allow you to have a shared set of behaviors, and can be thought of as add-ons that can make multiple changes to the factory's returned object.
     */
    trait: (name: TraitName, mod: TraitFuncOrInlineMod<T>) => void
}

export type Base<T> = CreateBase<T> | T
/**
 * A function that creates a partial representation of the factory's returned value, or modifies/overrides a part of it.
 */
export type CreateBase<T> = (utils: Utils) => T

/**
 * Creates a factory. Returns a function which creates a new object of the factory's shape.
 * @param base The base of the object.
 * @param define Callback to create traits in.
 * @return The factory function.
 */
export function factory<T, TraitName extends string>(base: Base<T>, define?: ({trait}: FactorySetupParams<T, TraitName>) => void): (overrides?: Partial<T>, traits?: TraitName[]) => T {
    const traitRegistry = new Map<string, TraitFuncOrInlineMod<T>>()
    const utils = createUtils()

    define?.({
        trait(name, mod) {
            if (traitRegistry.has(name)) {
                throw new TypeError(`Trait ${name} has already been registered!`)
            }

            traitRegistry.set(name, mod)
        },
    })

    return function createFactoryValue(overrides, traits) {
        let obj = typeof base === 'function' ? (base as CreateBase<T>)(utils) : base

        if (!obj) {
            throw new TypeError("The factory's base (or the return value of it) didn't give back an object", {
                cause: `Instead, I got: ${typeof obj} (value: ${obj})`,
            })
        }

        obj = toMerged(obj, overrides || {})

        if (!traits) return obj

        for (const traitName of traits) {
            const useTrait = traitRegistry.get(traitName)

            if (!useTrait) {
                throw new TypeError(`Trait ${traitName} couldn't be found`)
            }

            const traitResult = typeof useTrait === 'function'
                ? (useTrait as TraitModification<T>)(obj, utils)
                : useTrait

            obj = toMerged(obj as any, traitResult as any)
        }

        return obj
    }
}
