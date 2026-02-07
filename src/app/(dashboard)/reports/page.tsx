import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, ChevronRight } from "lucide-react"

export default async function ReportsPage() {
    const session = await auth()
    if (!session?.user?.name) return null

    const reports = await prisma.serviceReport.findMany({
        where: {
            user: { username: session.user.name }
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
                    <p className="text-muted-foreground">Tüm servis raporlarınızı buradan görüntüleyebilirsiniz.</p>
                </div>
                <Link href="/reports/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Yeni Rapor
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Rapor Listesi</CardTitle>
                    <CardDescription>Toplam {reports.length} rapor bulundu.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.length === 0 ? (
                            <div className="text-center py-10">
                                <FileText className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-3" />
                                <p className="text-muted-foreground">Henüz hiç rapor oluşturmadınız.</p>
                                <Link href="/reports/new" className="mt-4 inline-block">
                                    <Button variant="outline">İlk Raporu Oluştur</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {reports.map(report => (
                                    <Link key={report.id} href={`/reports/${report.id}/edit`} className="block group">
                                        <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors bg-card">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-2 h-12 rounded-full shrink-0"
                                                    style={{ backgroundColor: report.siteColor || '#3b82f6' }}
                                                />
                                                <div className="space-y-1">
                                                    <p className="font-semibold group-hover:text-primary transition-colors">{report.siteName}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <span>{format(report.startDate, 'dd MMM yyyy', { locale: tr })}</span>
                                                        <span>-</span>
                                                        <span>{format(report.endDate, 'dd MMM yyyy', { locale: tr })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-sm font-medium">{report.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(report.createdAt, 'dd.MM.yyyy HH:mm', { locale: tr })}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
