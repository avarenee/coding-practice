"use client"
import useDebounce from "@/utils/useDebounce";
import useFetch from "@/utils/useFetch";
import { useEffect, useReducer, useRef } from "react"

type Status = 'idle' | 'loading' | 'success' | 'error';

interface DebouncedSearchState {
  status: Status;
  query: string;
  error: string;
  searchResults: Array<string>;
}

interface DebouncedSearchAction {
  type: string;
  query?: string;
  error?: string;
  data?: Array<string>;
}

class SearchError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "SearchError";
    this.status = status;
  }
}

const onSearchError = (status: number) => {
  throw new SearchError(`Search failed ${status}`, status)
}

function reducer(state: DebouncedSearchState, action: DebouncedSearchAction) {
    switch (action.type) {
      case 'CHANGE_QUERY': {
        return {
          ...state,
          query: action.query
        } as DebouncedSearchState
      }
      case 'START_SEARCH': {
        if (action.query === state.query) {
          return {
            ...state,
            status: 'loading',
            error: '',
            searchResults: []
          } as DebouncedSearchState
        } else {
          return state
        }
      }
      case 'SEARCH_SUCCESS': {
        if (action.query === state.query) {
          return {
            ...state,
            status: 'success',
            error: '',
            searchResults: action.data ?? []
          } as DebouncedSearchState
        } else {
          return state
        }
      }
      case 'SEARCH_FAILURE': {
        return {
          ...state,
          status: 'error',
          error: action.error,
          searchResults: []
        } as DebouncedSearchState
      }
      case 'IDLE': {
        return {
          ...state,
          status: 'idle',
          error: '',
          searchResults: []
        } as DebouncedSearchState
      }
      default: {
        return state
      }
    }
}

export default function DebouncedSearch() {
  const initState: DebouncedSearchState = {
    status: 'idle',
    query: '',
    error: '',
    searchResults: []
  }
  const [state, dispatch] = useReducer(reducer, initState);
  const controllerRef = useRef<AbortController|null>(null);
  const debouncedQuery = useDebounce(state.query, 200);

  const getUsers = async (query: string) => {
    const controller = new AbortController();
    controllerRef.current = controller;

    dispatch({ type: 'START_SEARCH', query: debouncedQuery });

    try {
      const data = await useFetch(
        'http://dummyjson.com/users/search', 
        { q: query }, 
        { signal: controller.signal }, 
        onSearchError
      );
      const users = data.users.slice(0, 3).map((user: { firstName: string, lastName: string }) => `${user.firstName} ${user.lastName}`);
      if (controller.signal.aborted) return;
      dispatch({ type: 'SEARCH_SUCCESS', query: debouncedQuery, data: users })
    } catch (e) {
      if (controller.signal.aborted) return;
      const error = (e instanceof SearchError) ? "There was a search error" : "There was an unknown error"
      dispatch({ type: 'SEARCH_FAILURE', error })
    }
  }

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 2) {
      getUsers(debouncedQuery)
    } else {
      dispatch({ type: 'IDLE' })
    }

    return () => {
      controllerRef.current?.abort();
    }
  }, [debouncedQuery])
  return (
    <div className="w-50 m-4 space-y-4">
      <div>
        <label htmlFor="search">Search:</label>
        <input 
          id="search" 
          className="border border-white" 
          type="text"
          value={state.query}
          onChange={(e) => dispatch({ type: 'CHANGE_QUERY', query: e.target.value })}
        >
        </input>
      </div>
      <div className="border border-white min-h-10 p-2">
        {state.status === 'idle' && <div className="text-white/50">What are you looking for?</div>}
        {state.status === 'loading' && <div>Loading...</div>}
        {state.status === 'error' && <div className="text-red">{state.error}</div>}
        {state.status === 'success' && 
          <div>
            {state.searchResults.length === 0 && <div>No results</div>}
            {state.searchResults.length > 0 && (
              <ul className="space-y-2">
                {state.searchResults.map((result: string, idx: number) => 
                  <li key={idx}>{result}</li>
                )}
              </ul>
            )}
          </div>
        }
      </div>
    </div>
  )
}