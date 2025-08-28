"use client"

import { useState, useEffect, useCallback } from "react"

export interface Sku {
  id: number
  name: string
  stock: number
  sales: number
  delivery: number
  period: number
  color?: string
  notes?: string
  dateAdded: string
  selected: boolean
}

export interface Settings {
  defaultBuffer: number
  defaultPeriod: number
  darkTheme: boolean
}

export interface HistoryEntry {
  date: string
  stock: number
}

export interface NotificationData {
  id: string
  text: string
  type: "success" | "error" | "info"
  timestamp: number
}

export function useDeadlineGuard() {
  const [skuList, setSkuList] = useState<Sku[]>([])
  const [skuHistory, setSkuHistory] = useState<{ [skuId: string]: HistoryEntry[] }>({})
  const [reminders, setReminders] = useState<{ [skuId: string]: string }>({})
  const [settings, setSettings] = useState<Settings>({
    defaultBuffer: 3,
    defaultPeriod: 30,
    darkTheme: false,
  })
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSkuList = localStorage.getItem("deadlineGuardData")
    const savedHistory = localStorage.getItem("deadlineGuardHistory")
    const savedReminders = localStorage.getItem("deadlineGuardReminders")
    const savedSettings = localStorage.getItem("deadlineGuardSettings")

    if (savedSkuList) {
      try {
        setSkuList(JSON.parse(savedSkuList))
      } catch (e) {
        console.error("Error parsing saved SKU list:", e)
      }
    }

    if (savedHistory) {
      try {
        setSkuHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Error parsing saved history:", e)
      }
    }

    if (savedReminders) {
      try {
        setReminders(JSON.parse(savedReminders))
      } catch (e) {
        console.error("Error parsing saved reminders:", e)
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Error parsing saved settings:", e)
      }
    }
  }, [])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveData()
    }, 30000)

    return () => clearInterval(interval)
  }, [skuList, skuHistory, reminders, settings])

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveData()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [skuList, skuHistory, reminders, settings])

  const saveData = useCallback(() => {
    try {
      localStorage.setItem("deadlineGuardData", JSON.stringify(skuList))
      localStorage.setItem("deadlineGuardHistory", JSON.stringify(skuHistory))
      localStorage.setItem("deadlineGuardReminders", JSON.stringify(reminders))
      localStorage.setItem("deadlineGuardSettings", JSON.stringify(settings))
    } catch (e) {
      console.error("Error saving data:", e)
    }
  }, [skuList, skuHistory, reminders, settings])

  const showNotification = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    const notification: NotificationData = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: Date.now(),
    }

    setNotifications((prev) => [...prev, notification])

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    }, 3000)
  }, [])

  const updateHeaderStats = useCallback(() => {
    let critical = 0
    let warning = 0

    skuList.forEach((sku) => {
      const daysLeft = Math.floor(sku.stock / sku.sales)
      const orderDay = daysLeft - sku.delivery - settings.defaultBuffer

      if (orderDay <= 0) {
        critical++
      } else if (orderDay <= 3) {
        warning++
      }
    })

    return {
      total: skuList.length,
      critical,
      warning,
    }
  }, [skuList, settings.defaultBuffer])

  const checkReminders = useCallback(() => {
    const today = new Date().toLocaleDateString("ru-RU")
    const todayReminders = Object.entries(reminders).filter(([_, date]) => date === today)

    if (todayReminders.length > 0) {
      showNotification(`⏰ У вас есть напоминания (${todayReminders.length})`, "info")
    }
  }, [reminders, showNotification])

  return {
    skuList,
    setSkuList,
    skuHistory,
    setSkuHistory,
    reminders,
    setReminders,
    settings,
    setSettings,
    notifications,
    showNotification,
    updateHeaderStats,
    checkReminders,
    saveData,
  }
}
