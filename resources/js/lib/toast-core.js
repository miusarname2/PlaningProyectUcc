// Define action types as a plain object (numeric constants)
export const ActionType = {
    ADD_TOAST: 0,
    DISMISS_TOAST: 1,
    REMOVE_TOAST: 2,
};

let count = 0;

// Shared state for toasts
export const memoryState = {
    toasts: [],
};

// List of subscribers to state changes
export const listeners = [];

// Create and show a new toast
export const toast = ({ title, description, variant = 'default', action }) => {
    const id = (++count).toString();
    const newToast = {
        id,
        title,
        description,
        variant,
        action,
        open: true,
        onOpenChange: (open) => {
            if (!open) {
                dispatch({ type: ActionType.DISMISS_TOAST, toastId: id });
            }
        },
    };

    dispatch({ type: ActionType.ADD_TOAST, toast: newToast });
    return id;
};

// Dispatch actions to update state
export const dispatch = (action) => {
    switch (action.type) {
        case ActionType.ADD_TOAST: {
            memoryState.toasts = [...memoryState.toasts, action.toast];
            break;
        }
        case ActionType.DISMISS_TOAST: {
            memoryState.toasts = memoryState.toasts.map((t) =>
                t.id === action.toastId ? { ...t, open: false } : t
            );
            break;
        }
        case ActionType.REMOVE_TOAST: {
            memoryState.toasts = memoryState.toasts.filter((t) => t.id !== action.toastId);
            break;
        }
        default:
            break;
    }

    // Notify all listeners of the updated state
    listeners.forEach((listener) => listener({ ...memoryState }));
};
