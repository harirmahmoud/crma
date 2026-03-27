"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FolderOpen, Users, UserCheck, TrendingUp, Clock, Award, Activity, FileText
} from "lucide-react"
import axiosInstance from "@/lib/axios"

interface Cas {
  id?: number
  num_quitance: string
  date: string
  assure_id: number
  beneficiare_id: number
  franchise_id: number
  piece_id: number
  frais_engage: number
}
interface Adherent { id: number; nom: string; prenom: string }
interface Beneficiaire { id: number; nom: string; prenom: string; adherent_id: number }
interface Assure { id: number; nom: string }

export default function DashboardPage() {
  const [cas, setCas] = useState<Cas[]>([])
  const [adherents, setAdherents] = useState<Adherent[]>([])
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [assures, setAssures] = useState<Assure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [casRes, adhRes, bRes, aRes] = await Promise.all([
          axiosInstance.get("/cas"),
          axiosInstance.get("/adherent"),
          axiosInstance.get("/beneficiare"),
          axiosInstance.get("/assures"),
        ])
        setCas(casRes.data.cas?.data ?? casRes.data.cas ?? casRes.data)
        setAdherents(adhRes.data.adherents?.data ?? adhRes.data.adherents ?? adhRes.data)
        setBeneficiaires(bRes.data.beneficiares?.data ?? bRes.data.beneficiares ?? bRes.data)
        setAssures(aRes.data.assures?.data ?? aRes.data.assures ?? aRes.data)
      } catch (e) {
        console.error("Dashboard fetch error", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Computed stats ────────────────────────────────────────────────────────
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const isThisMonth = (d: string) => { const dt = new Date(d); return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear }
  const isLastMonth = (d: string) => { const dt = new Date(d); return dt.getMonth() === lastMonth && dt.getFullYear() === lastYear }

  const casThisMonth = useMemo(() => cas.filter((c) => isThisMonth(c.date)), [cas])
  const casLastMonth = useMemo(() => cas.filter((c) => isLastMonth(c.date)), [cas])

  const totalFrais = useMemo(() => cas.reduce((s, c) => s + Number(c.frais_engage || 0), 0), [cas])
  const fraisThisMonth = useMemo(() => casThisMonth.reduce((s, c) => s + Number(c.frais_engage || 0), 0), [casThisMonth])
  const fraisLastMonth = useMemo(() => casLastMonth.reduce((s, c) => s + Number(c.frais_engage || 0), 0), [casLastMonth])

  const casGrowth = casLastMonth.length > 0 ? (((casThisMonth.length - casLastMonth.length) / casLastMonth.length) * 100).toFixed(1) : null
  const fraisGrowth = fraisLastMonth > 0 ? (((fraisThisMonth - fraisLastMonth) / fraisLastMonth) * 100).toFixed(1) : null

  // Top adherents by cas count
  const adherentCasCount = useMemo(() => {
    const count = new Map<number, number>()
    for (const c of cas) {
      const benef = beneficiaires.find((b) => b.id === c.beneficiare_id)
      if (!benef) continue
      count.set(benef.adherent_id, (count.get(benef.adherent_id) ?? 0) + 1)
    }
    return Array.from(count.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        adherent: adherents.find((a) => a.id === id),
        count,
      }))
  }, [cas, beneficiaires, adherents])

  // Recent cas (last 8)
  const recentCas = useMemo(() => {
    return [...cas]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  }, [cas])

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const growthBadge = (val: string | null, positiveGood = true) => {
    if (val === null) return <span className="text-xs text-muted-foreground">— données insuffisantes</span>
    const num = parseFloat(val)
    const up = num >= 0
    const good = positiveGood ? up : !up
    const color = good ? "text-emerald-500" : "text-red-500"
    return <span className={`text-xs font-medium ${color}`}>{up ? "▲" : "▼"} {Math.abs(num)}% vs mois dernier</span>
  }

  // Performance: % of cas this month vs total
  const perfPct = cas.length > 0 ? ((casThisMonth.length / cas.length) * 100).toFixed(1) : "0"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Chargement du tableau de bord…</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Cas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cas</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cas.length}</div>
            <div className="mt-1">{growthBadge(casGrowth)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {casThisMonth.length} ce mois-ci
            </p>
          </CardContent>
        </Card>

        {/* Frais totaux */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frais Engagés (total)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(totalFrais)} DA</div>
            <div className="mt-1">{growthBadge(fraisGrowth)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {fmt(fraisThisMonth)} DA ce mois-ci
            </p>
          </CardContent>
        </Card>

        {/* Adhérents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adhérents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adherents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {assures.length} assurés enregistrés
            </p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité ce mois</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{perfPct}%</div>
            {/* progress bar */}
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${perfPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              du total des cas sur ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom panels ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top adhérents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" /> Top Adhérents
            </CardTitle>
            <CardDescription>Les adhérents avec le plus de cas</CardDescription>
          </CardHeader>
          <CardContent>
            {adherentCasCount.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
            ) : (
              <div className="space-y-3">
                {adherentCasCount.map(({ adherent, count }, idx) => {
                  const label = adherent
                    ? `${adherent.nom} ${adherent.prenom}`
                    : "Inconnu"
                  const max = adherentCasCount[0].count
                  const pct = Math.round((count / max) * 100)
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-4">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <span className="text-sm font-bold">{count} cas</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Activité Récente
            </CardTitle>
            <CardDescription>Les 8 derniers cas enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
            ) : (
              <div className="space-y-3">
                {recentCas.map((c, idx) => {
                  const assure = assures.find((a) => a.id === c.assure_id)
                  const benef = beneficiaires.find((b) => b.id === c.beneficiare_id)
                  const dt = new Date(c.date)
                  const age = Math.floor((Date.now() - dt.getTime()) / (1000 * 60 * 60 * 24))
                  const ageStr = age === 0 ? "aujourd'hui" : age === 1 ? "hier" : `il y a ${age} j`
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1.5 size-2 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          <span className="text-muted-foreground">Quittance </span>
                          {c.num_quitance}
                          {assure && (
                            <span className="text-muted-foreground"> — {assure.nom}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {benef ? `${benef.nom} ${benef.prenom}` : "—"} · {fmt(Number(c.frais_engage))} DA
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{ageStr}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Monthly breakdown ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Résumé du mois en cours
          </CardTitle>
          <CardDescription>
            {now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Cas traités</p>
              <p className="text-2xl font-bold mt-1">{casThisMonth.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Frais engagés</p>
              <p className="text-2xl font-bold mt-1">{fmt(fraisThisMonth)} DA</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Moy. par cas</p>
              <p className="text-2xl font-bold mt-1">
                {casThisMonth.length > 0 ? fmt(fraisThisMonth / casThisMonth.length) : "—"} DA
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Adhérents actifs</p>
              <p className="text-2xl font-bold mt-1">
                {new Set(casThisMonth.map((c) => {
                  const b = beneficiaires.find((b) => b.id === c.beneficiare_id)
                  return b?.adherent_id
                }).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
