"use client"
import { useReducer } from "react";

type Status = 'idle' | 'invalid' | 'loading' | 'success' | 'error';

interface ErrorInfo {
  errMsg: string;
}

interface FormFields {
  firstName: string,
  lastName: string,
  dob: string,
}

interface ValidationErrors {
  firstName: ErrorInfo,
  lastName: ErrorInfo,
  dob: ErrorInfo,
}

interface FormState {
  status: Status;
  formFields: FormFields;
  validationErrors: Partial<ValidationErrors> | null;
}

interface FormAction {
  type: string;
  formFields?: Partial<FormFields>;
  validationErrors?: Partial<ValidationErrors>;
}

function reducer(state: FormState, action: FormAction) {
  switch (action.type) {
    case 'SET_FORM': {
      return {
        ...state,
        formFields: {
          ...state.formFields,
          ...action.formFields
        }
      } as FormState
    }
    case 'VALIDATE_FORM': {
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          ...action.validationErrors
        }
      } as FormState
    }
    default: return state
  }
}

export default function FormValidation() {
  const initState: FormState = {
    status: 'idle',
    formFields: {
      firstName: '',
      lastName: '',
      dob: '',
    },
    validationErrors: null
  }
  const [state, dispatch] = useReducer(reducer, initState)

  function notEmpty(value: string) {
    if (value.trim() === '') {
      return false
    }
    return true
  }

  function validLength(value: string) {
    if (value.trim() === '') {
      return false
    }
    return true
  }

  return (
    <div>
      <div>
        <label htmlFor="first-name">First Name</label>
        <input 
          id="first-name"
          type="text"
        ></input>
        {state.validationErrors?.firstName && (<span className="text-red">{state.validationErrors?.firstName.errMsg}</span>)}
      </div>
      <div>
        <label htmlFor="last-name">Last Name</label>
        <input
          id="last-name" 
          type="text"
          onChange={(e) => {
            dispatch({ type: 'SET_FORM', formFields: { firstName: e.target.value } })
          }}
          onBlur={() => {
            if (!validLength(state.formFields.lastName)) {
              dispatch({ 
                type: 'VALIDATE_FORM', 
                validationErrors: {
                  lastName: {
                    errMsg: 'Last name must be at least 3 characters'
                  }
                }
              }) 
            } else if (!notEmpty(state.formFields.lastName)) {
              dispatch({ 
                type: 'VALIDATE_FORM', 
                validationErrors: {
                  lastName: {
                    errMsg: 'Last name is required'
                  }
                }
              }) 
            } else {
              const { lastName, ...newValidations} = state.validationErrors?
              dispatch({ 
                type: 'VALIDATE_FORM', 
                validationErrors: {
                  ...newValidations
                }
              }) 
            }
          }}
        ></input>
        {state.validationErrors?.lastName && (<span className="text-red">{state.validationErrors?.lastName.errMsg}</span>)}
      </div>
      <div>
        <label htmlFor="dob">DOB</label>
        <input 
          id="dob"
          type="text"
        ></input>
        {state.validationErrors?.dob && <span className="text-red">state.validationErrors?.dob.errMsg</span>}
      </div>
    </div>
  )
}