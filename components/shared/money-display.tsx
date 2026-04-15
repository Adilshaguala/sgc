"use client"

import { cn } from "@/lib/utils"

interface MoneyDisplayProps {
  value: number
  className?: string
  showCurrency?: boolean
}

export function MoneyDisplay({ value, className, showCurrency = true }: MoneyDisplayProps) {
  const formatted = new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

  return (
    <span className={cn("tabular-nums", className)}>
      {formatted}{showCurrency && " MT"}
    </span>
  )
}

export function formatMoney(value: number, showCurrency = true): string {
  const formatted = new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
  return showCurrency ? `${formatted} MT` : formatted
}
