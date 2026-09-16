import { useEffect, useState } from "react"

const useDebounce = (value: any, ms: number) => {
    const [debouncedValue, setDebouncedValue] = useState<any>(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, ms)

        return () => {
            clearTimeout(handler)
        }
    }, [value, ms])

    return debouncedValue
}

export default useDebounce