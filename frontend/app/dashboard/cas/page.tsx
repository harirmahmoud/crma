"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Plus, Edit, Trash2, Search, ChevronDown, Download } from "lucide-react"
import axiosInstance from "@/lib/axios"
// @ts-ignore
import * as XLSX from "xlsx-js-style"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"

// ── Types ──────────────────────────────────────────────────────────────────────
interface Cas {
    id?: number
    num_quitance: string
    date: string
    assure_id: number
    beneficiare_id: number
    franchise_id: number
    piece_id: number
    frais_engage: number
    total: number
}
interface Assure { id: number; nom: string }
interface Adherent { id: number; nom: string; prenom: string }
interface Beneficiaire { id: number; nom: string; prenom: string; adherent_id: number; lien?: string }
interface Franchise { id: number; nom: string; franchise: number }
interface Piece { id: number; nom: string }

// ── Reusable autocomplete ──────────────────────────────────────────────────────
function AutocompleteField<T extends { id: number }>({
    label, items, getLabel, selectedId, onSelect, placeholder = "Rechercher…",
}: {
    label: string; items: T[]
    getLabel: (item: T) => string
    selectedId: number | null
    onSelect: (item: T) => void
    placeholder?: string
}) {
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (selectedId !== null) {
            const found = items.find((i) => i.id === selectedId)
            setQuery(found ? getLabel(found) : String(selectedId))
        } else { setQuery("") }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, items])

    const suggestions = useMemo(() => {
        if (!query.trim()) return items
        const q = query.toLowerCase()
        return items.filter((i) => getLabel(i).toLowerCase().includes(q))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, query])

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node) &&
                listRef.current && !listRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", h)
        return () => document.removeEventListener("mousedown", h)
    }, [])

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="relative">
                <Input ref={inputRef} value={query} autoComplete="off" placeholder={placeholder}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                    onFocus={() => setOpen(true)} />
                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                {open && suggestions.length > 0 && (
                    <div ref={listRef} className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-44 overflow-y-auto">
                        {suggestions.map((item) => (
                            <button key={item.id} type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                onMouseDown={(e) => { e.preventDefault(); onSelect(item); setQuery(getLabel(item)); setOpen(false) }}>
                                <span className="font-medium">{getLabel(item)}</span>
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
                <p className="text-xs text-muted-foreground">Sélectionné: <span className="font-medium text-foreground">#{selectedId}</span></p>
            )}
        </div>
    )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CasPage() {
    const [data, setData] = useState<Cas[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Cas | null>(null)
    const [search, setSearch] = useState("")

    // Export state
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
    const [exportNumGestion, setExportNumGestion] = useState("")
    const [exportNumPolice, setExportNumPolice] = useState("")
    const [exportNumDossier, setExportNumDossier] = useState("")
    const [exportMonth, setExportMonth] = useState("")

    // Related data
    const [assures, setAssures] = useState<Assure[]>([])
    const [adherents, setAdherents] = useState<Adherent[]>([])
    const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
    const [franchises, setFranchises] = useState<Franchise[]>([])
    const [pieces, setPieces] = useState<Piece[]>([])

    // Form state
    const [numQuitance, setNumQuitance] = useState("")
    const [dateVal, setDateVal] = useState("")
    const [fraisEngage, setFraisEngage] = useState("")
    const [assureId, setAssureId] = useState<number | null>(null)
    const [beneficiaireId, setBeneficiaireId] = useState<number | null>(null)
    const [franchiseId, setFranchiseId] = useState<number | null>(null)
    const [pieceId, setPieceId] = useState<number | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await axiosInstance.get("/cas")
            setData(res.data.cas?.data ?? res.data.cas ?? res.data)
        } catch (e) { console.error("Failed to fetch cas", e) }
        finally { setLoading(false) }
    }

    const fetchRelated = async () => {
        try {
            const [aRes, adhRes, bRes, fRes, pRes] = await Promise.all([
                axiosInstance.get("/assures"),
                axiosInstance.get("/adherent"),
                axiosInstance.get("/beneficiare"),
                axiosInstance.get("/franchise"),
                axiosInstance.get("/piece"),
            ])
            setAssures(aRes.data.assures?.data ?? aRes.data.assures ?? aRes.data)
            setAdherents(adhRes.data.adherents?.data ?? adhRes.data.adherents ?? adhRes.data)
            setBeneficiaires(bRes.data.beneficiares?.data ?? bRes.data.beneficiares ?? bRes.data)
            setFranchises(fRes.data.franchises?.data ?? fRes.data.franchises ?? fRes.data)
            setPieces(pRes.data.piece?.data ?? pRes.data.piece ?? pRes.data)
        } catch (e) { console.error("Failed to fetch related data", e) }
    }

    useEffect(() => { fetchData(); fetchRelated() }, [])

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const q = search.toLowerCase()
        return data.filter((item) => item.num_quitance?.toLowerCase().includes(q))
    }, [data, search])

    // ── Export to Excel ────────────────────────────────────────────────────────
    const exportToExcel = () => {
        if (!exportMonth) {
            alert("Veuillez sélectionner un mois pour l'export.");
            return;
        }

        const [yearStr, monthStr] = exportMonth.split("-")
        const year = parseInt(yearStr, 10)
        const month = parseInt(monthStr, 10) - 1 // 0-indexed

        // Filter to selected month
        const monthData = data.filter((cas) => {
            const d = new Date(cas.date)
            return d.getMonth() === month && d.getFullYear() === year
        })

        // Helpers
        const findAssure = (id: number) => assures.find((x) => x.id === id)
        const findBenef = (id: number) => beneficiaires.find((x) => x.id === id)
        const findAdherent = (id: number) => adherents.find((x) => x.id === id)
        const findFranchise = (id: number) => franchises.find((x) => x.id === id)
        const findPiece = (id: number) => pieces.find((x) => x.id === id)


        // Group by adherent_id (resolved via beneficiaire)
        const groups = new Map<number, Cas[]>()
        for (const cas of monthData) {
            const benef = findBenef(cas.beneficiare_id)
            const adhId = benef?.adherent_id ?? -1
            if (!groups.has(adhId)) groups.set(adhId, [])
            groups.get(adhId)!.push(cas)
        }

        const monthName = new Date(year, month).toLocaleString("fr-FR", { month: "long", year: "numeric" })
        // Build rows (array of arrays)
        const rows: (string | number)[][] = []

        // Sheet title
        rows.push([`Export Cas — ${monthName}`])
        if (exportNumGestion) rows.push(["Convention de Gestion d'Assurance :N ", exportNumGestion])
        rows.push(["CRMA:MOHAMMADIA Produit : Assurance Complementaire Sante Groupe "])
        if (exportNumPolice) rows.push(["Service pour Sinistre Police d'assurance N :", exportNumPolice])
        if (exportNumDossier) rows.push(["Souscripteur:Collection MOHAMMADIA Dossier Sinistre N :", exportNumDossier])
        rows.push([]) // blank


        const COL_HEADERS = [
            "Adhérent", "Num Quitence", "Assuré", "Bénéficiaire", "Lien de bénéficiaire",
            "Franchise (Nom)", "Frais Engagés", "Franchise (Valeur)", "Total", "Pièce", "Date",
        ]

        let grandTotalFrais = 0
        let grandTotal = 0

        const merges: { s: { r: number, c: number }, e: { r: number, c: number } }[] = []

        for (const [adhId, cases] of groups) {
            const adh = findAdherent(adhId)
            const adhLabel = adh ? `${adh.nom} ${adh.prenom}` : `Adhérent #${adhId}`

            // Section header
            rows.push([`Adhérent : ${adhLabel}`])
            rows.push(COL_HEADERS)

            let sumFrais = 0
            let sumTotal = 0

            const mergeStartRow = rows.length

            cases.forEach((cas, index) => {
                const assure = findAssure(cas.assure_id)
                const benef = findBenef(cas.beneficiare_id)
                const franchise = findFranchise(cas.franchise_id)
                const piece = findPiece(cas.piece_id)

                const fraisVal = Number(cas.frais_engage) || 0
                const franchiseVal = Number(franchise?.franchise) || 0
                const total = fraisVal - franchiseVal

                sumFrais += fraisVal
                sumTotal += total

                rows.push([
                    index === 0 ? adhLabel : "",
                    cas.num_quitance,
                    assure?.nom ?? `#${cas.assure_id}`,
                    benef ? `${benef.nom} ${benef.prenom}` : `#${cas.beneficiare_id}`,
                    benef?.lien ?? "",
                    franchise?.nom ?? `#${cas.franchise_id}`,
                    fraisVal,
                    franchiseVal,
                    total,
                    piece?.nom ?? `#${cas.piece_id}`,
                    cas.date
                ])
            })

            const mergeEndRow = rows.length - 1
            if (mergeEndRow > mergeStartRow) {
                merges.push({ s: { r: mergeStartRow, c: 0 }, e: { r: mergeEndRow, c: 0 } })
            }

            // Subtotal row for adherent
            rows.push([
                `TOTAL ${adhLabel}`, "", "", "", "", "",
                sumFrais, "", sumTotal
            ])
            rows.push([]) // blank separator

            grandTotalFrais += sumFrais
            grandTotal += sumTotal
        }

        // Grand total
        rows.push(["TOTAL GÉNÉRAL", "", "", "", "", "", grandTotalFrais, "", grandTotal])

        // Build sheet
        const ws = XLSX.utils.aoa_to_sheet(rows)
        if (merges.length > 0) {
            ws["!merges"] = merges
        }

        // Apply borders and alignment to all non-empty cells
        const borderStyle = {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
        };

        for (const cell in ws) {
            if (cell.startsWith("!")) continue;
            if (!ws[cell].s) ws[cell].s = {};
            ws[cell].s.border = borderStyle;
            ws[cell].s.alignment = { vertical: "center", wrapText: true };
        }

        // Column widths
        ws["!cols"] = [
            { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 },
            { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 12 },
        ]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Cas")
        XLSX.writeFile(wb, `cas_${year}-${String(month + 1).padStart(2, "0")}.xlsx`)

        // Reset export state
        setIsExportDialogOpen(false);
        setExportNumGestion("");
        setExportNumPolice("");
        setExportNumDossier("");
        setExportMonth("");
    }
    // ──────────────────────────────────────────────────────────────────────────

    const resetForm = () => {
        setNumQuitance(""); setDateVal(""); setFraisEngage("")
        setAssureId(null); setBeneficiaireId(null); setFranchiseId(null); setPieceId(null)
    }

    const handleOpenCreate = () => { setEditingItem(null); resetForm(); setIsDialogOpen(true) }

    const handleOpenEdit = (item: Cas) => {
        setEditingItem(item)
        setNumQuitance(item.num_quitance); setDateVal(item.date)
        setFraisEngage(item.frais_engage.toString())
        setAssureId(item.assure_id); setBeneficiaireId(item.beneficiare_id)
        setFranchiseId(item.franchise_id); setPieceId(item.piece_id)
        setIsDialogOpen(true)
    }

    const handleDelete = async (identifier: string | number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce cas ?")) return
        try { await axiosInstance.delete(`/cas/${identifier}`); fetchData() }
        catch (e) { console.error("Failed to delete cas", e) }
    }

    const handleSubmit = async (e?: React.FormEvent, forceCreate = false) => {
        if (e) e.preventDefault()
        if (!assureId) { alert("Veuillez sélectionner un assuré."); return }
        if (!beneficiaireId) { alert("Veuillez sélectionner un bénéficiaire."); return }
        if (!franchiseId) { alert("Veuillez sélectionner une franchise."); return }

        const payload = {
            date: dateVal,
            assure_id: assureId, beneficiare_id: beneficiaireId,
            franchise_id: franchiseId, piece_id: pieceId,
            frais_engage: parseFloat(fraisEngage),
            force_create: forceCreate
        }
        try {
            if (editingItem) await axiosInstance.put(`/cas/${editingItem.id ?? editingItem.num_quitance}`, payload)
            else await axiosInstance.post("/cas", payload)
            setIsDialogOpen(false); fetchData()
        } catch (err: any) {
            console.error("Failed to save cas", err)
            const data = err.response?.data
            if (data?.requires_force) {
                if (window.confirm(`${data.message}\n\nVoulez-vous quand même continuer et forcer la création/modification ?`)) {
                    handleSubmit(undefined, true)
                }
            } else {
                alert(data?.message || "Une erreur s'est produite lors de l'enregistrement.")
            }
        }
    }

    // Label helpers for table display
    const lblAssure = (id: number) => assures.find((x) => x.id === id)?.nom ?? String(id)
    const lblBenef = (id: number) => { const b = beneficiaires.find((x) => x.id === id); return b ? `${b.nom} ${b.prenom}` : String(id) }
    const lblFranchise = (id: number) => franchises.find((x) => x.id === id)?.nom ?? String(id)
    const lblPiece = (id: number) => pieces.find((x) => x.id === id)?.nom ?? String(id)

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Gestion des Cas</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
                        <Download className="mr-2 h-4 w-4" /> Exporter
                    </Button>
                    <Button onClick={handleOpenCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter
                    </Button>
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher par numéro quittance..." value={search}
                    onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Numéro</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Assuré</TableHead>
                            <TableHead>Bénéficiaire</TableHead>
                            <TableHead>Franchise</TableHead>
                            <TableHead>Pièce</TableHead>
                            <TableHead>Frais Engagés</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} className="text-center">Chargement...</TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={8} className="text-center">Aucun cas trouvé.</TableCell></TableRow>
                        ) : filtered.map((item) => (
                            <TableRow key={item.id ?? item.num_quitance}>
                                <TableCell>{item.num_quitance}</TableCell>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{lblAssure(item.assure_id)}</TableCell>
                                <TableCell>{lblBenef(item.beneficiare_id)}</TableCell>
                                <TableCell>{lblFranchise(item.franchise_id)}</TableCell>
                                <TableCell>{lblPiece(item.piece_id)}</TableCell>
                                <TableCell>{item.frais_engage}</TableCell>
                                <TableCell>{item.total}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id ?? item.num_quitance)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Modifier Cas" : "Ajouter Cas"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <Label htmlFor="dateVal">Date</Label>
                                <Input type="date" id="dateVal" value={dateVal} onChange={(e) => setDateVal(e.target.value)} required />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="fraisEngage">Frais Engagés</Label>
                                <Input type="number" step="0.01" id="fraisEngage" value={fraisEngage}
                                    onChange={(e) => setFraisEngage(e.target.value)} required />
                            </div>
                        </div>

                        <AutocompleteField label="Assuré" items={assures}
                            getLabel={(a) => a.nom} selectedId={assureId}
                            onSelect={(a) => setAssureId(a.id)} placeholder="Rechercher un assuré…" />

                        <AutocompleteField label="Bénéficiaire" items={beneficiaires}
                            getLabel={(b) => `${b.nom} ${b.prenom}`} selectedId={beneficiaireId}
                            onSelect={(b) => setBeneficiaireId(b.id)} placeholder="Rechercher un bénéficiaire…" />

                        <AutocompleteField label="Franchise" items={franchises}
                            getLabel={(f) => f.nom} selectedId={franchiseId}
                            onSelect={(f) => setFranchiseId(f.id)} placeholder="Rechercher une franchise…" />

                        <AutocompleteField label="Pièce" items={pieces}
                            getLabel={(p) => p.nom} selectedId={pieceId}
                            onSelect={(p) => setPieceId(p.id)} placeholder="Rechercher une pièce…" />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Exporter vers Excel</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="exportMonth">Mois (pour filtrer les cas)</Label>
                            <Input
                                type="month"
                                id="exportMonth"
                                value={exportMonth}
                                onChange={(e) => setExportMonth(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exportNumGestion">Numéro de gestion d'assurance</Label>
                            <Input
                                id="exportNumGestion"
                                value={exportNumGestion}
                                onChange={(e) => setExportNumGestion(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exportNumPolice">Numéro de police d'assurance</Label>
                            <Input
                                id="exportNumPolice"
                                value={exportNumPolice}
                                onChange={(e) => setExportNumPolice(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exportNumDossier">Numéro de dossier sinistre</Label>
                            <Input
                                id="exportNumDossier"
                                value={exportNumDossier}
                                onChange={(e) => setExportNumDossier(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsExportDialogOpen(false)}>Annuler</Button>
                        <Button type="button" onClick={exportToExcel}>Exporter</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
