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

interface Piece {
    id: number
    type: string
    nom: string
    description: string
}

export default function PiecePage() {
    const [data, setData] = useState<Piece[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Piece | null>(null)
    const [search, setSearch] = useState("")

    // Form state
    const [typeVal, setTypeVal] = useState("")
    const [nom, setNom] = useState("")
    const [description, setDescription] = useState("")

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await axiosInstance.get("/piece")
            console.log(res.data)
            setData(res.data.piece.data || res.data)
        } catch (error) {
            console.error("Failed to fetch pieces", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const q = search.toLowerCase()
        return data.filter(
            (item) =>
                item.nom?.toLowerCase().includes(q) ||
                item.type?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
        )
    }, [data, search])

    const handleOpenCreate = () => {
        setEditingItem(null)
        setTypeVal("")
        setNom("")
        setDescription("")
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (item: Piece) => {
        setEditingItem(item)
        setTypeVal(item.type)
        setNom(item.nom)
        setDescription(item.description)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette pièce ?")) return
        try {
            await axiosInstance.delete(`/piece/${id}`)
            fetchData()
        } catch (error) {
            console.error("Failed to delete piece", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { type: typeVal, nom, description }
        try {
            if (editingItem) {
                await axiosInstance.put(`/piece/${editingItem.id}`, payload)
            } else {
                await axiosInstance.post("/piece", payload)
            }
            setIsDialogOpen(false)
            fetchData()
        } catch (error) {
            console.error("Failed to save piece", error)
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Gestion des Pièces</h1>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par nom, type..."
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
                            <TableHead>Type</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Chargement...</TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Aucune pièce trouvée.</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.nom}</TableCell>
                                    <TableCell>{item.description}</TableCell>
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
                        <DialogTitle>{editingItem ? "Modifier Pièce" : "Ajouter Pièce"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="typeVal">Type</Label>
                            <Input id="typeVal" value={typeVal} onChange={(e) => setTypeVal(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom</Label>
                            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
