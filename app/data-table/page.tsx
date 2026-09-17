"use client"
import useFetch from "@/utils/useFetch";
import { useEffect, useReducer, useRef } from "react"

type Status = 'default' | 'loading' | 'success' | 'error';
const RESULTS_PER_PAGE = 10;

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

interface Product {
  title: string;
  category: string;
  price: number;
  stock: number;
  tags?: Array<string>;
  dimensions?: Dimensions;
}

interface ProductTable {
  status: Status;
  products: Array<Product>;
  page: number;
  total: number;
  error: string;
}

interface ProductTableAction {
  type: string;
  data?: Array<Product>;
  total?: number;
  error?: string;
}

class TableError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "TableError";
    this.status = status;
  }
}

function onTableError(status: number) {
  throw new TableError(`There was a table error with code ${status}`, status)
}


function reducer(state: ProductTable, action: ProductTableAction) {
  switch (action.type) {
    case 'FIRST_PAGE': {
      return {
        ...state,
        page: 0
      } as ProductTable
    }
    case 'PREV_PAGE': {
      if (state.page > 0) {
        return {
          ...state,
          page: state.page - 1
        } as ProductTable
      } else {
        return state
      }
    }
    case 'NEXT_PAGE': {
      if (state.page < Math.ceil(state.total/RESULTS_PER_PAGE)) {
        return {
          ...state,
          page: state.page + 1
        } as ProductTable
      } else {
        return state
      }
    }
    case 'LAST_PAGE': {
      return {
        ...state,
        page: Math.ceil(state.total/RESULTS_PER_PAGE)
      } as ProductTable
    }
    case 'LOAD_DATA': {
      return {
        ...state,
        status: 'loading',
        error: ''
      } as ProductTable
    }
    case 'DATA_SUCCESS': {
      return {
        status: 'success',
        products: action.data ?? [],
        total: action.total,
        error: ''
      } as ProductTable
    }
    case 'DATA_FAILURE': {
      return {
        ...state,
        status: 'error',
        error: action.error ?? ''
      } as ProductTable
    }
    default: {
      return state
    }
  }
}

export default function DataTable() {
  const initState: ProductTable = {
    status: 'default',
    products: [],
    page: 0,
    total: 0,
    error: ''
  }
  const headers = [
    "title",
    "category",
    "price",
    "stock",
    "tags",
    "width",
    "height",
    "depth"
  ]

  const [state, dispatch] = useReducer(reducer, initState)
  const controllerRef = useRef<AbortController|null>(null);

  async function getProducts() {
    dispatch({ type: 'LOAD_DATA' });
    const controller = new AbortController();
    controllerRef.current = controller;
    const data = await useFetch(
      'https://dummyjson.com/products', 
      { limit: RESULTS_PER_PAGE, skip: state.page*RESULTS_PER_PAGE },
      { signal: controller.signal },
      onTableError
    )
    return data
  }

  useEffect(() => {
    if (state.page >= 0) {
      getProducts()
        .then((data) => {
          dispatch({ type: 'DATA_SUCCESS', data: data.products, total: data.total })
        })
        .catch((e) => {
          if (controllerRef.current?.signal.aborted) return;
          dispatch({ 
            type: 'DATA_FAILURE', 
            error: (e instanceof TableError) 
              ? "There was an error loading the table" 
              : "There was an unknown error" 
          })
        });
    }

    console.log(state.total)

    return () => {
      controllerRef.current?.abort();
    }
  }, [state.page, state.total]);

  return (
    <div className="m-4">
      { state.status === 'loading' && <div>Loading</div> }
      { state.status === 'error' && <div>{state.error}</div> }
      { state.status === 'success' && (
        <div className="space-y-4">
          <table className="border border-white">
            <thead>
              <tr className="mx-2">
                {headers.map((header, idx) => (<th key={idx}>{header}</th>))}
              </tr>
            </thead>
            <tbody>
              {state.products.map((product, idx) => 
                <tr className="mx-2" key={idx}>
                  <td>{product.title}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>{product.tags ? product.tags.join(", ") : ""}</td>
                  <td>{product.dimensions?.width}</td>
                  <td>{product.dimensions?.height}</td>
                  <td>{product.dimensions?.depth}</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex space-x-2">
            <button 
              className="px-2 border border-white"
              onClick={() => dispatch({ type: 'FIRST_PAGE' })}
            >
              first
            </button>
            <button 
              className="px-2 border border-white"
              onClick={() => dispatch({ type: 'PREV_PAGE' })}
            >
              prev
            </button>
            <button 
              className="px-2 border border-white"
              onClick={() => dispatch({ type: 'NEXT_PAGE' })}
            >
              next
            </button>
            <button 
              className="px-2 border border-white"
              onClick={() => dispatch({ type: 'LAST_PAGE' })}
            >
              last
            </button>
          </div>
        </div>
      )}
    </div>
  )
}