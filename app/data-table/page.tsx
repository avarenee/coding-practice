"use client"
import useFetch from "@/utils/useFetch";
import { useEffect, useReducer, useRef } from "react"

type Status = 'default' | 'loading' | 'success' | 'error';

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
  error: string;
}

interface ProductTableAction {
  type: string;
  data?: Array<Product>;
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
      {},
      { signal: controller.signal },
      onTableError
    )
    return data.products
  }

  useEffect(() => {
    getProducts()
      .then((data) => {
        dispatch({ type: 'DATA_SUCCESS', data })
      })
      .catch((e) => {
        dispatch({ 
          type: 'DATA_FAILURE', 
          error: (e instanceof TableError) 
            ? "There was an error loading the table" 
            : "There was an unknown error" 
        })
      });
    
    return () => {
      controllerRef.current?.abort();
    }
  }, [])

  return (
    <div className="m-4 border border-white">
      { state.status === 'loading' && <div>Loading</div> }
      { state.status === 'error' && <div>{state.error}</div> }
      { state.status === 'success' && (
        <table>
          <thead>
            <tr>
              {headers.map((header, idx) => (<th key={idx}>{header}</th>))}
            </tr>
          </thead>
          <tbody>
            {state.products.map((product, idx) => 
              <tr key={idx}>
                <td>{product.title}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>{product.tags ? product.tags.join(", ") : ""}</td>
                <td>{product.dimensions?.width}</td>
                <td>{product.dimensions?.height}</td>
                <td>{product.dimensions?.depth}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}