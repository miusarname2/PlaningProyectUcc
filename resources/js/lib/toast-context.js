import { useState, useEffect } from 'react'
import { ActionType, listeners, memoryState, dispatch, toast as internalToast } from '@/lib/toast-core'

export function useToast() {
    const [state, setState] = useState(memoryState)

    useEffect(() => {
        listeners.push(setState)
        return () => {
            const idx = listeners.indexOf(setState)
            if (idx > -1) listeners.splice(idx, 1)
        }
    }, [])

    return {
        ...state,
        toast: internalToast,
        dismiss: (id) => dispatch({ type: ActionType.DISMISS_TOAST, toastId: id }),
    }
}
