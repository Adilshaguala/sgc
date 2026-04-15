"use client"

import { Badge } from "@/components/ui/badge"
import type { EstadoContrato, NivelAcademico } from "@/types"
import { cn } from "@/lib/utils"

const estadoStyles: Record<EstadoContrato, { label: string; className: string }> = {
  rascunho: {
    label: "Rascunho",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
  },
  gerado: {
    label: "Gerado",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  },
  assinado: {
    label: "Assinado",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300",
  },
  visado: {
    label: "Visado",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300",
  },
  arquivado: {
    label: "Arquivado",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
  },
}

const nivelStyles: Record<NivelAcademico, { label: string; className: string }> = {
  licenciado: {
    label: "Licenciado",
    className: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300",
  },
  mestre: {
    label: "Mestre",
    className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300",
  },
  doutorado: {
    label: "Doutorado",
    className: "bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900 dark:text-rose-300",
  },
}

interface StatusBadgeProps {
  estado: EstadoContrato
}

export function StatusBadge({ estado }: StatusBadgeProps) {
  const style = estadoStyles[estado]
  return (
    <Badge variant="secondary" className={cn("font-medium", style.className)}>
      {style.label}
    </Badge>
  )
}

interface NivelBadgeProps {
  nivel: NivelAcademico
}

export function NivelBadge({ nivel }: NivelBadgeProps) {
  const style = nivelStyles[nivel]
  return (
    <Badge variant="secondary" className={cn("font-medium", style.className)}>
      {style.label}
    </Badge>
  )
}
