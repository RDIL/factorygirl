import {toMerged} from "es-toolkit"
import {createUtils, Utils} from "./utils"

export type TraitModification<FactoryType> = (value: FactoryType, utils: Utils) => Partial<FactoryType>
export type TraitFuncOrInlineMod<FactoryType> = TraitModification<FactoryType> | Partial<FactoryType>

export type FactoryCtor<T, TraitName extends string> = {
    trait: (name: TraitName, mod: TraitFuncOrInlineMod<T>) => void
}

export type Base<T> = CreateBase<T> | T
export type CreateBase<T> = (utils: Utils) => T

export function factory<T, TraitName extends string>(base: Base<T>, define: ({trait}: FactoryCtor<T, TraitName>) => void): (traits?: TraitName[]) => T {
    const traitRegistry = new Map<string, TraitFuncOrInlineMod<T>>()
    const utils = createUtils()

    define({
        trait(name, mod) {
            if (traitRegistry.has(name)) {
                throw new TypeError(`Trait ${name} has already been registered!`)
            }

            traitRegistry.set(name, mod)
        },
    })

    return function createFactoryValue(traits) {
        let obj = typeof base === 'function' ? (base as CreateBase<T>)(utils) : base

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
