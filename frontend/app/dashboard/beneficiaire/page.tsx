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

interface Beneficiaire {
    id: number
    nom: string
    prenom: string
    date_naissance: string
    adherent_id: number
    lien: string
}

interface Adherent {
    id: number
    nom: string
    prenom: string
}

export default function BeneficiairePage() {
    const [data, setData] = useState<Beneficiaire[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Beneficiaire | null>(null)
    const [search, setSearch] = useState("")

    // Adherent autocomplete state
    const [adherents, setAdherents] = useState<Adherent[]>([])
    const [adherentQuery, setAdherentQuery] = useState("")
    const [adherentId, setAdherentId] = useState<number | null>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const adherentInputRef = useRef<HTMLInputElement>(null)
    const suggestionRef = useRef<HTMLDivElement>(null)

    // Form state
    const [nom, setNom] = useState("")
    const [prenom, setPrenom] = useState("")
    const [dateNaissance, setDateNaissance] = useState("")
    const [lien, setLien] = useState("")

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await axiosInstance.get("/beneficiare")
            setData(res.data.beneficiares?.data ?? res.data.beneficiares ?? res.data)
        } catch (error) {
            console.error("Failed to fetch beneficiaires", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAdherents = async () => {
        try {
            const res = await axiosInstance.get("/adherent")
            setAdherents(res.data.adherents?.data ?? res.data.adherents ?? res.data)
        } catch (error) {
            console.error("Failed to fetch adherents", error)
        }
    }

    useEffect(() => {
        fetchData()
        fetchAdherents()
    }, [])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                adherentInputRef.current &&
                !adherentInputRef.current.contains(e.target as Node) &&
                suggestionRef.current &&
                !suggestionRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const filteredAdherents = useMemo(() => {
        if (!adherentQuery.trim()) return adherents
        const q = adherentQuery.toLowerCase()
        return adherents.filter(
            (a) =>
                a.nom?.toLowerCase().includes(q) ||
                a.prenom?.toLowerCase().includes(q)
        )
    }, [adherents, adherentQuery])

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const q = search.toLowerCase()
        return data.filter(
            (item) =>
                item.nom?.toLowerCase().includes(q) ||
                item.prenom?.toLowerCase().includes(q) ||
                item.lien?.toLowerCase().includes(q)
        )
    }, [data, search])

    const resetForm = () => {
        setNom("")
        setPrenom("")
        setDateNaissance("")
        setLien("")
        setAdherentId(null)
        setAdherentQuery("")
    }

    const handleOpenCreate = () => {
        setEditingItem(null)
        resetForm()
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (item: Beneficiaire) => {
        setEditingItem(item)
        setNom(item.nom)
        setPrenom(item.prenom)
        setDateNaissance(item.date_naissance)
        setLien(item.lien)
        setAdherentId(item.adherent_id)
        // Try to pre-fill the display label from the loaded adherents list
        const found = adherents.find((a) => a.id === item.adherent_id)
        setAdherentQuery(found ? `${found.nom} ${found.prenom}` : String(item.adherent_id))
        setIsDialogOpen(true)
    }

    const handleSelectAdherent = (a: Adherent) => {
        setAdherentId(a.id)
        setAdherentQuery(`${a.nom} ${a.prenom}`)
        setShowSuggestions(false)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?")) return
        try {
            await axiosInstance.delete(`/beneficiare/${id}`)
            fetchData()
        } catch (error) {
            console.error("Failed to delete beneficiaire", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!adherentId) {
            alert("Veuillez sélectionner un adhérent.")
            return
        }
        const payload = {
            nom,
            prenom,
            date_naissance: dateNaissance,
            adherent_id: adherentId,
            lien
        }
        try {
            if (editingItem) {
                await axiosInstance.put(`/beneficiare/${editingItem.id}`, payload)
            } else {
                await axiosInstance.post("/beneficiare", payload)
            }
            setIsDialogOpen(false)
            fetchData()
        } catch (error) {
            console.error("Failed to save beneficiaire", error)
        }
    }

    // Look up the nom from adherents list for display in the table
    const getAdherentLabel = (id: number) => {
        const a = adherents.find((x) => x.id === id)
        return a ? `${a.nom} ${a.prenom}` : String(id)
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Gestion des Bénéficiaires</h1>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par nom, prénom ou lien..."
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
                            <TableHead>Prénom</TableHead>
                            <TableHead>Adhérent</TableHead>
                            <TableHead>Lien</TableHead>
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
                                <TableCell colSpan={6} className="text-center">Aucun bénéficiaire trouvé.</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.nom}</TableCell>
                                    <TableCell>{item.prenom}</TableCell>
                                    <TableCell>{getAdherentLabel(item.adherent_id)}</TableCell>
                                    <TableCell>{item.lien}</TableCell>
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
                        <DialogTitle>{editingItem ? "Modifier Bénéficiaire" : "Ajouter Bénéficiaire"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom</Label>
                            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prenom">Prénom</Label>
                            <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateNaissance">Date de Naissance</Label>
                            <Input type="date" id="dateNaissance" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required />
                        </div>

                        {/* Adherent autocomplete */}
                        <div className="space-y-2">
                            <Label htmlFor="adherentSearch">Adhérent</Label>
                            <div className="relative">
                                <Input
                                    id="adherentSearch"
                                    ref={adherentInputRef}
                                    value={adherentQuery}
                                    onChange={(e) => {
                                        setAdherentQuery(e.target.value)
                                        setAdherentId(null)
                                        setShowSuggestions(true)
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Rechercher un adhérent..."
                                    autoComplete="off"
                                />
                                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                {showSuggestions && filteredAdherents.length > 0 && (
                                    <div
                                        ref={suggestionRef}
                                        className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto"
                                    >
                                        {filteredAdherents.map((a) => (
                                            <button
                                                key={a.id}
                                                type="button"
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    handleSelectAdherent(a)
                                                }}
                                            >
                                                <span className="font-medium">{a.nom} {a.prenom}</span>
                                                <span className="ml-2 text-muted-foreground text-xs">#{a.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {showSuggestions && adherentQuery.trim() && filteredAdherents.length === 0 && (
                                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
                                        Aucun adhérent trouvé
                                    </div>
                                )}
                            </div>
                            {adherentId && (
                                <p className="text-xs text-muted-foreground">
                                    Adhérent sélectionné: <span className="font-medium text-foreground">#{adherentId}</span>
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lien">Lien</Label>
                            <Input id="lien" value={lien} onChange={(e) => setLien(e.target.value)} required />
                        </div>
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
