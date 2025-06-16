"use client"

import { useEffect, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/Components/ui/popover"
import { Card, CardContent } from "@/Components/ui/card"
import { Avatar, AvatarImage } from "@/Components/ui/avatar"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Building2, ChevronDown, Check } from "lucide-react"

type Company = {
  id: string
  trade_name: string
  logo_url: string | null
  company_type: string
  active: boolean
}

type HookFormProps = { control: any; name: string }
type StandaloneProps = { value: string | null; onChange: (id: string) => void }

type Props = HookFormProps | StandaloneProps

export default function CompanyVisualSelector(props: Props) {
  const viaHookForm = "control" in props
  const field = viaHookForm
    ? { value: props.value, onChange: props.onChange }
    : { value: props.value, onChange: props.onChange }

  const [companies, setCompanies] = useState<Company[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const mockCompanies: Company[] = [
      {
        id: "1",
        trade_name: "Esto es un mock, devuelve el cambio si está mal",
        logo_url: "/placeholder.svg?height=40&width=40",
        company_type: "Sin data",
        active: true,
      }
    ]
    setCompanies(mockCompanies)
  }, [])

  const selected = companies.find((c) => c.id === field.value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between gap-2 h-12 border-gray-300 hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            {selected ? (
              <>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={selected.logo_url ?? ""} alt={selected.trade_name} />
                </Avatar>
                <span className="text-sm">{selected.trade_name}</span>
              </>
            ) : (
              <span className="text-gray-500">Seleccionar empresa</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-2 border-gray-200 shadow-lg">
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-700 px-2 py-1">Selecciona una empresa</h4>
        </div>
        <ScrollArea className="h-[250px]">
          <div className="space-y-1">
            {companies.map((c) => (
              <Card
                key={c.id}
                className={`cursor-pointer transition-all duration-200 border ${
                  field.value === c.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => {
                  field.onChange(c.id)
                  setOpen(false)
                }}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarImage src={c.logo_url ?? ""} alt={c.trade_name} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{c.trade_name}</div>
                    <div className="text-xs text-gray-500">Tipo: {c.company_type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.active ? "default" : "destructive"} className="text-xs">
                      {c.active ? "Activa" : "Inactiva"}
                    </Badge>
                    {field.value === c.id && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
