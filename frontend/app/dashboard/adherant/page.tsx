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

interface Adherant {
    id: number
    nom: string
    prenom: string
    date_naissance: string
    num: number
}

export default function AdherantPage() {
    const [data, setData] = useState<Adherant[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Adherant | null>(null)
    const [search, setSearch] = useState("")

    // Form state
    const [num, setNum] = useState<number>(0)
    const [nom, setNom] = useState("")
    const [prenom, setPrenom] = useState("")
    const [dateNaissance, setDateNaissance] = useState("")

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await axiosInstance.get("/adherent")

            setData(res.data.adherents.data || res.data)
        } catch (error) {
            console.error("Failed to fetch adherents", error)
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
                item.prenom?.toLowerCase().includes(q)
        )
    }, [data, search])

    const handleOpenCreate = () => {
        setEditingItem(null)
        setNom("")
        setPrenom("")
        setDateNaissance("")
        setNum(0)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (item: Adherant) => {
        setEditingItem(item)
        setNom(item.nom)
        setPrenom(item.prenom)
        setDateNaissance(item.date_naissance)
        setNum(item.num)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet adhérent ?")) return
        try {
            await axiosInstance.delete(`/adherent/${id}`)
            fetchData()
        } catch (error) {
            console.error("Failed to delete adherent", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { id: num, nom, prenom, date_naissance: dateNaissance }
        try {
            if (editingItem) {
                await axiosInstance.put(`/adherent/${editingItem.id}`, payload)
            } else {
                await axiosInstance.post("/adherent", payload)
            }
            setIsDialogOpen(false)
            fetchData()
        } catch (error) {
            console.error("Failed to save adherent", error)
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Gestion des Adhérents</h1>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par nom ou prénom..."
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
                            <TableHead>Num </TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Prénom</TableHead>
                            <TableHead>Date de Naissance</TableHead>
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
                                <TableCell colSpan={6} className="text-center">Aucun adhérent trouvé.</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.num}</TableCell>
                                    <TableCell>{item.nom}</TableCell>
                                    <TableCell>{item.prenom}</TableCell>
                                    <TableCell>{item.date_naissance}</TableCell>
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
                        <DialogTitle>{editingItem ? "Modifier Adhérent" : "Ajouter Adhérent"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Num</Label>
                            <Input id="nom" value={num} onChange={(e) => setNum(Number(e.target.value))} required />
                        </div>
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
                        <DialogFooter>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
