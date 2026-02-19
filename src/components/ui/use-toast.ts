"use client"

// Inspired by shadcn/ui toast component

import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = any // Simplified for brevity

// Simplified version for immediate use

// Simplified version for immediate use
import { useState, useEffect } from 'react'

export interface Toast {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: "default" | "destructive"
}

const listeners: Array<(state: any) => void> = []
let memoryState: { toasts: Toast[] } = { toasts: [] }

function dispatch(action: any) {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => {
        listener(memoryState)
    })
}

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            }
        case "DISMISS_TOAST":
            return {
                ...state,
                toasts: state.toasts.filter((t: any) => t.id !== action.toastId),
            }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                }
            }
            return {
                ...state,
                toasts: state.toasts.filter((t: any) => t.id !== action.toastId),
            }
    }
    return state
}

function toast({ ...props }: Omit<Toast, "id">) {
    const id = Math.random().toString(36).substring(2, 9)

    const update = (props: ToasterToast) =>
        dispatch({
            type: "UPDATE_TOAST",
            toast: { ...props, id },
        })
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open: boolean) => {
                if (!open) dismiss()
            },
        },
    })

    return {
        id: id,
        dismiss,
        update,
    }
}

function useToast() {
    const [state, setState] = useState<{ toasts: Toast[] }>(memoryState)

    useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: "REMOVE_TOAST", toastId }),
    }
}

export { useToast, toast }
