const useFetch = async (
    url: string, 
    queryParams?: Record<string,any>, 
    options?: Record<string,any>,
    errorHandler?: (status: number) => void
) => {
    const queryString = new URLSearchParams(queryParams).toString();
    const res = await fetch(`${url}${queryString && `?${queryString}`}`, options);
    if (!res.ok) {
        if (errorHandler) {
            errorHandler(res.status)
        } else {
            throw new Error(`Error: ${res.status}`)
        }
    }
    const data = await res.json();
    return data
}

export default useFetch