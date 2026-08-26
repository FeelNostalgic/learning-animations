"use client"

import { Laptop, Server, Network, Shield, Cloud, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DynamicNode, NodeType } from "@/types/dynamic-animation"

interface AssetsSidebarProps {
  onAddNode: (type: NodeType) => void
  selectedNode: DynamicNode | null
  onUpdateNode: (node: DynamicNode) => void
  onDeleteNode: (nodeId: string) => void
}

const ASSET_TYPES: { type: NodeType; label: string; icon: any; desc: string }[] = [
  { type: "pc", label: "PC / Host", icon: Laptop, desc: "Equipo cliente final" },
  { type: "switch", label: "Switch", icon: Network, desc: "Conmutador de Capa 2" },
  { type: "router", label: "Router", icon: Shield, desc: "Enrutador de Capa 3" },
  { type: "server", label: "Servidor", icon: Server, desc: "Servidor o Data Center" },
  { type: "cloud", label: "Internet / Nube", icon: Cloud, desc: "Red externa WAN" },
]

export function AssetsSidebar({
  onAddNode,
  selectedNode,
  onUpdateNode,
  onDeleteNode,
}: AssetsSidebarProps) {
  return (
    <aside className="flex h-full w-80 flex-col border-r border-border bg-card/60 backdrop-blur-md">
      <div className="border-b border-border p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Biblioteca de Assets
        </h2>
        <p className="text-xs text-muted-foreground">
          Haz clic en un componente para añadirlo al lienzo
        </p>
      </div>

      {/* Asset Palette */}
      <div className="grid grid-cols-1 gap-2 p-4">
        {ASSET_TYPES.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.type}
              onClick={() => onAddNode(item.type)}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-accent/40 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      {/* Node Inspector */}
      {selectedNode ? (
        <div className="mt-auto border-t border-border bg-card/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Propiedades del Nodo
            </h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              className="h-7 px-2 text-xs"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Eliminar
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Nombre / Etiqueta</label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => onUpdateNode({ ...selectedNode, label: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Dirección IP</label>
                <input
                  type="text"
                  placeholder="192.168.1.10"
                  value={selectedNode.ip || ""}
                  onChange={(e) => onUpdateNode({ ...selectedNode, ip: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Máscara / Prefijo</label>
                <input
                  type="text"
                  placeholder="24"
                  value={selectedNode.mask || ""}
                  onChange={(e) => onUpdateNode({ ...selectedNode, mask: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Dirección MAC</label>
              <input
                type="text"
                placeholder="AA:BB:CC:11:22:33"
                value={selectedNode.mac || ""}
                onChange={(e) => onUpdateNode({ ...selectedNode, mac: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto border-t border-border p-4 text-center text-xs text-muted-foreground">
          Selecciona un nodo en el lienzo para ver y editar sus propiedades de red.
        </div>
      )}
    </aside>
  )
}
