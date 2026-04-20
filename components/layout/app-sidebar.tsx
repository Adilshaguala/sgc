"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  Building2,
  UserCheck,
  FileSignature,
  MapPin,
  DollarSign,
  ChevronDown,
  GraduationCap,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Docentes",
    href: "/docentes",
    icon: Users,
  },
  {
    title: "Cadeiras",
    href: "/cadeiras",
    icon: BookOpen,
  },
  {
    title: "Contratos",
    href: "/contratos",
    icon: FileText,
  },
]

const configNavItems = [
  {
    title: "Instituicao",
    href: "/configuracoes/instituicao",
    icon: Building2,
  },
  {
    title: "Departamentos",
    href: "/configuracoes/departamentos",
    icon: GraduationCap,
  },
  {
    title: "Assinantes",
    href: "/configuracoes/assinantes",
    icon: UserCheck,
  },
  {
    title: "Clausulas",
    href: "/configuracoes/clausulas",
    icon: FileSignature,
  },
  {
    title: "Centros de Recursos",
    href: "/configuracoes/centros-recursos",
    icon: MapPin,
  },
  {
    title: "Cursos",
    href: "/configuracoes/cursos",
    icon: BookOpen,
  },
  {
    title: "Tabela Salarial",
    href: "/configuracoes/tabela-salarial",
    icon: DollarSign,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const isConfigActive = pathname.startsWith("/configuracoes")

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">CEAD/UPM</span>
            <span className="text-xs text-sidebar-foreground/70">Gestao de Contratos</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href === "/dashboard" && pathname === "/")}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isConfigActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={cn(isConfigActive && "bg-sidebar-accent")}>
                      <Settings className="h-4 w-4" />
                      <span>Configuracoes</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {configNavItems.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === item.href}
                          >
                            <Link href={item.href}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-4 py-3">
          <p className="text-xs text-sidebar-foreground/50">
            Universidade Pedagogica de Maputo
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
