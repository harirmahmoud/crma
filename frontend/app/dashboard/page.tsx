import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChartIcon, UsersIcon, ActivityIcon, TrendingUpIcon } from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12.5%",
    icon: UsersIcon,
  },
  {
    title: "Active Sessions",
    value: "1,234",
    change: "+8.2%",
    icon: ActivityIcon,
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "+23.1%",
    icon: TrendingUpIcon,
  },
  {
    title: "Performance",
    value: "98.2%",
    change: "+2.4%",
    icon: BarChartIcon,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your application.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="size-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Activity item {i}</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["API Calls", "Storage Used", "Bandwidth", "Requests"].map((item, i) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item}</span>
                  <span className="text-sm font-medium">{85 - i * 10}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
