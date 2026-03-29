"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Plus, Edit, Trash2, Search, ChevronDown } from "lucide-react"
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

interface Franchise {
    id: number
    nom: string
    franchise: number | null
    pourcentage: number | null
    grp_franchise_id: number
    condition_id: number
}

interface GrpFranchise {
    id: number
    nom: string
}

interface Condition {
    id: number
    nom: string
}

// ── Reusable autocomplete field ────────────────────────────────────────────────
function AutocompleteField<T extends { id: number; nom: string }>({
    label,
    items,
    selectedId,
    onSelect,
    placeholder = "Rechercher…",
}: {
    label: string
    items: T[]
    selectedId: number | null
    onSelect: (item: T) => void
    placeholder?: string
}) {
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // Pre-fill label when selectedId changes from outside (edit mode)
    useEffect(() => {
        if (selectedId !== null) {
            const found = items.find((i) => i.id === selectedId)
            if (found) setQuery(found.nom)
        } else {
            setQuery("")
        }
    }, [selectedId, items])

    const suggestions = useMemo(() => {
        if (!query.trim()) return items
        const q = query.toLowerCase()
        return items.filter((i) => i.nom?.toLowerCase().includes(q))
    }, [items, query])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                inputRef.current && !inputRef.current.contains(e.target as Node) &&
                listRef.current && !listRef.current.contains(e.target as Node)
            ) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                {open && suggestions.length > 0 && (
                    <div
                        ref={listRef}
                        className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto"
                    >
                        {suggestions.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    onSelect(item)
                                    setQuery(item.nom)
                                    setOpen(false)
                                }}
                            >
                                <span className="font-medium">{item.nom}</span>
                                <span className="ml-2 text-muted-foreground text-xs">#{item.id}</span>
                            </button>
                        ))}
                    </div>
                )}
                {open && query.trim() && suggestions.length === 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
                        Aucun résultat
                    </div>
                )}
            </div>
            {selectedId !== null && (
                <p className="text-xs text-muted-foreground">
                    Sélectionné: <span className="font-medium text-foreground">#{selectedId}</span>
                </p>
            )}
        </div>
    )
}
// ──────────────────────────────────────────────────────────────────────────────

export default function FranchisePage() {
    const [data, setData] = useState<Franchise[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Franchise | null>(null)
    const [search, setSearch] = useState("")

    // Related lists
    const [grpFranchises, setGrpFranchises] = useState<GrpFranchise[]>([])
    const [conditions, setConditions] = useState<Condition[]>([])

    // Form state
    const [nom, setNom] = useState("")
    const [isPercentage, setIsPercentage] = useState(false)
    const [franchiseVal, setFranchiseVal] = useState("")
    const [pourcentageVal, setPourcentageVal] = useState("")
    const [grpFranchiseId, setGrpFranchiseId] = useState<number | null>(null)
    const [conditionId, setConditionId] = useState<number | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await axiosInstance.get("/franchise")
            setData(res.data.franchises?.data ?? res.data.franchises ?? res.data)
        } catch (error) {
            console.error("Failed to fetch franchises", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRelated = async () => {
        try {
            const [grpRes, condRes] = await Promise.all([
                axiosInstance.get("/grpFranchise"),
                axiosInstance.get("/condition"),
            ])
            setGrpFranchises(grpRes.data.grpFranchises?.data ?? grpRes.data.grpFranchises ?? grpRes.data)
            setConditions(condRes.data.conditions?.data ?? condRes.data.conditions ?? condRes.data)
        } catch (error) {
            console.error("Failed to fetch related data", error)
        }
    }

    useEffect(() => {
        fetchData()
        fetchRelated()
    }, [])

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const q = search.toLowerCase()
        return data.filter((item) => item.nom?.toLowerCase().includes(q))
    }, [data, search])

    const resetForm = () => {
        setNom("")
        setIsPercentage(false)
        setFranchiseVal("")
        setPourcentageVal("")
        setGrpFranchiseId(null)
        setConditionId(null)
    }

    const handleOpenCreate = () => {
        setEditingItem(null)
        resetForm()
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (item: Franchise) => {
        setEditingItem(item)
        setNom(item.nom)
        if (item.pourcentage && item.pourcentage > 0) {
            setIsPercentage(true)
            setPourcentageVal(item.pourcentage.toString())
            setFranchiseVal("")
        } else {
            setIsPercentage(false)
            setFranchiseVal(item.franchise?.toString() || "")
            setPourcentageVal("")
        }
        setGrpFranchiseId(item.grp_franchise_id)
        setConditionId(item.condition_id)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette franchise ?")) return
        try {
            await axiosInstance.delete(`/franchise/${id}`)
            fetchData()
        } catch (error) {
            console.error("Failed to delete franchise", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!grpFranchiseId) { alert("Veuillez sélectionner un groupe de franchise."); return }
        if (!conditionId) { alert("Veuillez sélectionner une condition."); return }

        const payload = {
            nom,
            franchise: isPercentage ? null : parseFloat(franchiseVal || "0"),
            pourcentage: isPercentage ? parseFloat(pourcentageVal || "0") : null,
            grp_franchise_id: grpFranchiseId,
            condition_id: conditionId,
        }
        try {
            if (editingItem) {
                await axiosInstance.put(`/franchise/${editingItem.id}`, payload)
            } else {
                await axiosInstance.post("/franchise", payload)
            }
            setIsDialogOpen(false)
            fetchData()
        } catch (error) {
            console.error("Failed to save franchise", error)
        }
    }

    const getLabel = (list: { id: number; nom: string }[], id: number) =>
        list.find((x) => x.id === id)?.nom ?? String(id)

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Gestion des Franchises</h1>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            </div>

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
                            <TableHead>Valeur</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Groupe</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Aucune franchise trouvée.</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.nom}</TableCell>
                                    <TableCell>
                                        {item.pourcentage ? `${item.pourcentage}%` : `${item.franchise} DA`}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.pourcentage ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {item.pourcentage ? 'Pourcentage' : 'Valeur Fixe'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{getLabel(grpFranchises, item.grp_franchise_id)}</TableCell>
                                    <TableCell>{getLabel(conditions, item.condition_id)}</TableCell>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Modifier Franchise" : "Ajouter Franchise"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom</Label>
                            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
                        </div>

                        <div className="space-y-3 p-3 border rounded-md bg-muted/30">
                            <Label>Type de Retenue</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={!isPercentage ? "default" : "outline"}
                                    onClick={() => setIsPercentage(false)}
                                    className="flex-1"
                                >
                                    Valeur Fixe
                                </Button>
                                <Button
                                    type="button"
                                    variant={isPercentage ? "default" : "outline"}
                                    onClick={() => setIsPercentage(true)}
                                    className="flex-1"
                                >
                                    Pourcentage
                                </Button>
                            </div>

                            {!isPercentage ? (
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="franchiseVal">Montant de la Franchise (DA)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        id="franchiseVal"
                                        value={franchiseVal}
                                        onChange={(e) => setFranchiseVal(e.target.value)}
                                        required={!isPercentage}
                                        placeholder="Ex: 2000"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="pourcentageVal">Pourcentage (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        max="100"
                                        id="pourcentageVal"
                                        value={pourcentageVal}
                                        onChange={(e) => setPourcentageVal(e.target.value)}
                                        required={isPercentage}
                                        placeholder="Ex: 20"
                                    />
                                </div>
                            )}
                        </div>

                        <AutocompleteField
                            label="Groupe de Franchise"
                            items={grpFranchises}
                            selectedId={grpFranchiseId}
                            onSelect={(g) => setGrpFranchiseId(g.id)}
                            placeholder="Rechercher un groupe…"
                        />

                        <AutocompleteField
                            label="Condition"
                            items={conditions}
                            selectedId={conditionId}
                            onSelect={(c) => setConditionId(c.id)}
                            placeholder="Rechercher une condition…"
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
