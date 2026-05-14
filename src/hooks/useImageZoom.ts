import { useState, useCallback, useRef } from 'react'

export function useImageZoom(initialZoom = 100) {
  const [zoom, setZoom] = useState(initialZoom)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  const clampZoom = (z: number) => Math.max(10, Math.min(500, z))

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -10 : 10
    setZoom((prev) => clampZoom(prev + delta))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, panX, panY }
  }, [panX, panY])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    const scale = zoomRef.current / 100
    const dx = (e.clientX - dragStart.current.x) / scale
    const dy = (e.clientY - dragStart.current.y) / scale
    setPanX(dragStart.current.panX + dx)
    setPanY(dragStart.current.panY + dy)
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  const resetView = useCallback(() => {
    setZoom(initialZoom)
    setPanX(0)
    setPanY(0)
  }, [initialZoom])

  return {
    zoom,
    setZoom,
    panX,
    panY,
    dragging,
    clampZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
  }
}
