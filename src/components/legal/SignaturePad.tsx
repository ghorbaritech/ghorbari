'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser, RotateCcw } from 'lucide-react'

interface SignaturePadProps {
    onSave: (signatureData: string) => void
    height?: number
    width?: number
}

export default function SignaturePad({ onSave, height = 200, width = 500 }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const lastDataRef = useRef<string>('')
    const isMounted = useRef(true)

    useEffect(() => {
        isMounted.current = true
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 2.5
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
        }

        return () => {
            isMounted.current = false
        }
    }, [])

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isMounted.current) return
        setIsDrawing(true)
        setHasStarted(true)
        
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top

        ctx.beginPath()
        ctx.moveTo(x, y)
    }, [])

    const stopDrawing = useCallback(() => {
        if (!isMounted.current) return
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (canvas) {
            const dataUrl = canvas.toDataURL()
            if (dataUrl !== lastDataRef.current) {
                lastDataRef.current = dataUrl
                onSave(dataUrl)
            }
        }
    }, [onSave])

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isMounted.current) return

        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top

        ctx.lineTo(x, y)
        ctx.stroke()
    }, [isDrawing])

    const clearCanvas = useCallback(() => {
        if (!isMounted.current) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasStarted(false)
        lastDataRef.current = ''
        onSave('')
    }, [onSave])

    return (
        <div className="space-y-4">
            <div className="border-4 border-neutral-900 rounded-2xl bg-white overflow-hidden relative group shadow-inner">
                <canvas
                    ref={canvasRef}
                    height={height}
                    width={width}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="cursor-crosshair w-full h-full"
                />
                {!hasStarted && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-600 font-bold uppercase text-[10px] tracking-[0.2em] italic">
                        Digital Signature Field
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center bg-neutral-900/50 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 italic">
                        Securing Active Capture...
                    </span>
                </div>
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearCanvas}
                        className="h-9 px-4 text-[10px] uppercase font-black tracking-widest text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5"
                    >
                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                        Reset Canvas
                    </Button>
                </div>
            </div>
        </div>
    )
}
