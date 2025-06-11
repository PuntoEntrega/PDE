// src/Components/CompanyVisualSelector/index.tsx
"use client"

import { useEffect, useState } from "react"
import { useController, Control } from "react-hook-form"
import { getCompaniesByGlobalContext } from "@/Services/context_global_companies"
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/Components/ui/popover"
import { Card, CardContent } from "@/Components/ui/card"
import { Avatar, AvatarImage } from "@/Components/ui/avatar"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Building2 } from "lucide-react"

/** ❶ — Tipos --------------------------------------------------------------- */
type Company = {
  id: string
  trade_name: string
  logo_url: string | null
  company_type: string
  active: boolean
}

type HookFormProps = { control: Control<any>; name: string }
type StandaloneProps = { value: string | null; onChange: (id: string) => void }

type Props = HookFormProps | StandaloneProps

/** ❷ — Componente ----------------------------------------------------------- */
export default function CompanyVisualSelector(props: Props) {
  /* A. source of truth */
  const viaHookForm = "control" in props
  const { field } = viaHookForm
    ? useController({ name: props.name, control: props.control })
    : { field: { value: props.value, onChange: props.onChange } }

  /* B. datos de empresas */
  const [companies, setCompanies] = useState<Company[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getCompaniesByGlobalContext().then((c) => setCompanies(c ?? []))
  }, [])

  const selected = companies.find((c) => c.id === field.value)

  /* C. UI */
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Building2 size={16} />
          {selected ? (
            <>
              <Avatar className="w-6 h-6">
                <AvatarImage src={selected.logo_url ?? ""} alt={selected.trade_name} />
              </Avatar>
              <span>{selected.trade_name}</span>
            </>
          ) : (
            <span>Seleccionar empresa</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-2">
        <ScrollArea className="h-[250px]">
          {companies.map((c) => (
            <Card
              key={c.id}
              className="mb-2 hover:bg-muted cursor-pointer transition"
              onClick={() => {
                field.onChange(c.id)
                setOpen(false)
              }}
            >
              <CardContent className="flex gap-4 p-2 items-center">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={c.logo_url ?? ""} alt={c.trade_name} />
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{c.trade_name}</div>
                  <div className="text-xs text-muted-foreground">Tipo: {c.company_type}</div>
                </div>
                <Badge variant={c.active ? "default" : "destructive"}>
                  {c.active ? "Activa" : "Inactiva"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
