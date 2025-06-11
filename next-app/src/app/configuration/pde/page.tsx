// src/app/configuration/pde/page.tsx
import { Metadata } from "next"
import PdeConfigComponent from "./PDEConfigClient"

export const metadata: Metadata = {
  title: "Configuración de PDE",
}

export default function PdePage() {
  return <PdeConfigComponent />
}
