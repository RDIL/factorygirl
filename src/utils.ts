export type Utils = {
    sequentialValue: (category?: string) => number
    sequentialUuid: (category?: string) => string
}

export function createUtils() {
    const counters = new Map<string, number>()

    const getAndIncrement = (category: string) => {
        const current = counters.get(category) ?? 0
        counters.set(category, current + 1)
        return current
    }

    return {
        sequentialValue(category?) {
            return getAndIncrement(`sequentialValue-${category}`)
        },
        sequentialUuid(category?) {
            return getAndIncrement(`sequentialUuid-${category}`)
                .toString(16)
                .padStart(32, "0")
                .replace(/([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})/g, '$1-$2-$3-$4-$5')
        }
    } satisfies Utils
}
