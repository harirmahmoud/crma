"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import axiosInstance from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

interface ConditionData {
    max?: number | string
    plafond?: number | string
    dure?: string | null
}

interface Condition {
    id: number
    nom: string
    condition: ConditionData | string
}

export default function ConditionPage() {
    const [data, setData] = useState<Condition[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Condition | null>(null)
    const [search, setSearch] = useState("")

    // Form state
    const [nom, setNom] = useState("")
    const [max, setMax] = useState("")
    const [plafond, setPlafond] = useState("")
    const [dure, setDure] = useState("")

    // Durée selector visible only when max or plafond has a value
    const showDure = max.trim() !== "" || plafond.trim() !== ""

    const fetchData = async () => {
        try {
            setLoading(true)

            if (search.trim()) {
                const res = await axiosInstance.get("/condition", {
                    params: {
                        q: search
                    }
                })
                setData(res.data.conditions?.data ?? res.data.conditions ?? res.data)
            } else {
                const res = await axiosInstance.get("/condition")
                setData(res.data.conditions?.data ?? res.data.conditions ?? res.data)
            }

        } catch (error) {
            console.error("Failed to fetch conditions", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [search])

    // Client-side search filter
    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const q = search.toLowerCase()
        return data.filter((item) => item.nom?.toLowerCase().includes(q))
    }, [data, search])

    const resetForm = () => {
        setNom("")
        setMax("")
        setPlafond("")
        setDure("")
    }

    const handleOpenCreate = () => {
        setEditingItem(null)
        resetForm()
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (item: Condition) => {
        setEditingItem(item)
        setNom(item.nom ?? "")
        const cond: ConditionData =
            typeof item.condition === "object" && item.condition !== null
                ? (item.condition as ConditionData)
                : {}
        setMax(cond.max !== undefined ? String(cond.max) : "")
        setPlafond(cond.plafond !== undefined ? String(cond.plafond) : "")
        setDure(cond.dure ?? "")
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette condition ?")) return
        try {
            await axiosInstance.delete(`/condition/${id}`)
            fetchData()
        } catch (error) {
            console.error("Failed to delete condition", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const conditionPayload: ConditionData = {}
        if (max.trim()) conditionPayload.max = max
        if (plafond.trim()) conditionPayload.plafond = plafond
        if (showDure && dure) conditionPayload.dure = dure

        const payload = { nom, condition: conditionPayload }

        try {
            if (editingItem) {
                await axiosInstance.put(`/condition/${editingItem.id}`, payload)
            } else {
                await axiosInstance.post("/condition", payload)
            }
            setIsDialogOpen(false)
            fetchData()
        } catch (error) {
            console.error("Failed to save condition", error)
        }
    }

    const formatCondition = (cond: ConditionData | string) => {
        if (typeof cond === "string") return cond
        if (!cond) return "—"
        const parts: string[] = []
        if (cond.max !== undefined) parts.push(`Max: ${cond.max}`)
        if (cond.plafond !== undefined) parts.push(`Plafond: ${cond.plafond}`)
        if (cond.dure) parts.push(`Durée: ${cond.dure}`)
        return parts.join(" | ") || "—"
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Gestion des Conditions</h1>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            </div>

            {/* Search bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par nom..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Chargement...</TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">Aucune condition trouvée.</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell className="font-medium">{item.nom}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{formatCondition(item.condition)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Modifier Condition" : "Ajouter Condition"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nom — required */}
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom <span className="text-destructive">*</span></Label>
                            <Input
                                id="nom"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                placeholder="Ex: Condition standard"
                                required
                            />
                        </div>

                        {/* Max & Plafond — optional */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="max">Max <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                                <Input
                                    id="max"
                                    type="number"
                                    step="0.01"
                                    value={max}
                                    onChange={(e) => setMax(e.target.value)}
                                    placeholder="Ex: 5000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plafond">Plafond <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                                <Input
                                    id="plafond"
                                    type="number"
                                    step="0.01"
                                    value={plafond}
                                    onChange={(e) => setPlafond(e.target.value)}
                                    placeholder="Ex: 10000"
                                />
                            </div>
                        </div>

                        {/* Durée — appears conditionally */}
                        {showDure && (
                            <div className="space-y-2">
                                <Label htmlFor="dure">Durée <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                                <select
                                    id="dure"
                                    value={dure}
                                    onChange={(e) => setDure(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option className="bg-black" value="">-- Sélectionner --</option>
                                    <option className="bg-black" value="annee">Année</option>
                                    <option className="bg-black" value="mois">Mois</option>
                                </select>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
