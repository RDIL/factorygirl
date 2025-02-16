export type Utils = {
    /**
     * Create a sequential value.
     * @param category The "category" string is used as a way to uniquely identify each counter.
     */
    sequentialValue: (category?: string | undefined) => number
    /**
     * Create a sequential UUID v4.
     * @param category The "category" string is used as a way to uniquely identify each counter.
     */
    sequentialUuid: (category?: string | undefined) => string
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
