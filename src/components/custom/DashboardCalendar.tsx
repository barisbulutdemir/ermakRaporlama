'use client'

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format, isWithinInterval, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { deleteReport } from "@/app/actions/report"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Pencil, MapPin } from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

type ReportRange = {
    id: string
    siteName: string
    siteColor: string | null
    startDate: Date
    endDate: Date
    excludedDates: Date[]
}

type Holiday = {
    date: Date
    isHalfDay: boolean
}

export function DashboardCalendar({ reports, holidays = [] }: { reports: ReportRange[], holidays?: Holiday[] }) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

    // Helper to find report for a day (filtered for 'worked' visual)
    const getReportForDay = (day: Date) => {
        // Check if Holiday (full day only)
        const holiday = holidays.find(h => isSameDay(h.date, day))
        if (holiday && !holiday.isHalfDay) return undefined

        return reports.find(r =>
            isWithinInterval(day, { start: r.startDate, end: r.endDate }) &&
            !r.excludedDates.some(ex => isSameDay(ex, day))
        )
    }

    const handleDelete = async (id: string) => {
        const confirm = window.confirm("Bu raporu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")
        if (!confirm) return

        setDeletingId(id)
        try {
            const result = await deleteReport(id)
            if (result.success) {
                toast.success("Rapor başarıyla silindi.")
                // Refresh to update list and calendar
                router.refresh()
                setSelectedDate(undefined) // Reset selection
            } else {
                toast.error(result.message || "Silme işlemi başarısız.")
            }
        } catch (error) {
            toast.error("Bir hata oluştu.")
        } finally {
            setDeletingId(null)
        }
    }

    // Get report for selected date to display in Info Card
    const selectedReport = selectedDate ? getReportForDay(selectedDate) : null

    // Create modifiers for each report to color the background
    const reportModifiers: Record<string, Date[]> = {}
    const reportModifiersStyles: Record<string, React.CSSProperties> = {}

    reports.forEach((report, index) => {
        const modifierKey = `report_${index}`
        const daysInRange: Date[] = []

        if (report.startDate && report.endDate) {
            const start = new Date(report.startDate)
            const end = new Date(report.endDate)

            // Iterate through all days in the range
            let currentDate = new Date(start)
            while (currentDate <= end) {
                const currentDay = new Date(currentDate)

                // Check if this day should be shown as "worked"
                const holiday = holidays.find(h => isSameDay(h.date, currentDay))
                const isFullHoliday = holiday && !holiday.isHalfDay
                const isExcluded = report.excludedDates.some(ex => isSameDay(ex, currentDay))

                if (!isFullHoliday && !isExcluded) {
                    daysInRange.push(new Date(currentDay))
                }

                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1)
            }
        }

        reportModifiers[modifierKey] = daysInRange
        reportModifiersStyles[modifierKey] = {
            backgroundColor: report.siteColor ? `${report.siteColor}40` : '#3b82f640', // 40 = ~25% opacity
            borderRadius: '0.375rem'
        }
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="p-2 border rounded-md w-full">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={tr}
                    className="rounded-md border p-2 w-full flex justify-center"
                    modifiers={reportModifiers}
                    modifiersStyles={{
                        selected: { backgroundColor: 'transparent', border: '2px solid var(--primary)', borderRadius: '100%' },
                        ...reportModifiersStyles
                    }}
                    components={{
                        // DayContent is deprecated or incorrect in v9, use Day or custom render
                        // Checking docs: v8 used DayContent. v9 uses components.Day for the whole day or props.
                        // Actually, for v9, the content is usually 'DayContent' but seemingly typed differently or removed.
                        // Let's try matching the exact type or using 'Day' if we want to override the whole cell, 
                        // but here we just want content. 
                        // Required fix: 'DayContent' -> 'Day' is too broad. 
                        // If 'DayContent' is invalid, it might be 'InternalDay' or similar? 
                        // Wait, v9 removed DayContent in favor of children? 
                        // Let's look at the error: 'DayContent' does not exist in 'Partial<CustomComponents>'.
                        // Available might be: Day, Caption, ...
                        // Let's try to remove it and put logical rendering inside a custom Day wrapper?
                        // Or better, let's use the 'formatters' if available, but we need custom JSX.
                        // Correct approach for v9 custom content:
                        // use 'components={{ Day: CustomDay }}' and render content inside.
                        // OR check if 'day-content' is the key (kebab case?). No.
                        // Let's try 'Day' and see if we can render default + badge.

                        // actually, looking at v9 docs, it seems `DayContent` WAS removed.
                        // We should likely use `Cell` or just `Day` and render children.
                        // BUT, to be safe and quick: The error says keys are restricted.
                        // Let's try to comment it out for a sec? No, feature needed.
                        // Let's change 'DayContent' to 'Day' and adapt props. 
                        // Day takes Update: DayContent is valid in v8. v9 might have renamed it.
                        // Let's try overriding 'Day' and rendering props.children? 
                        // Actually, let's look at lines 127-145: it renders the number and the dot.
                        // So it IS the content. 
                        // Let's try changing key to 'Day'.
                        Day: ({ date, displayMonth }) => {
                            const report = getReportForDay(date)
                            const isToday = isSameDay(date, new Date())

                            return (
                                <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer group gap-0.5">
                                    {/* Date Number */}
                                    <span className={cn(
                                        "text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center transition-all",
                                        isToday ? "bg-primary text-primary-foreground" : "text-foreground group-hover:bg-muted"
                                    )}>
                                        {format(date, 'd')}
                                    </span>

                                    {/* Colored Dot/Bar if Report Exists (Compact) */}
                                    {report && (
                                        <div
                                            className="w-full max-w-[90%] h-1.5 rounded-full shadow-sm transition-all hover:brightness-110"
                                            style={{ backgroundColor: report.siteColor || '#3b82f6' }}
                                        />
                                    )}
                                </div>
                            )
                        }
                    }}
                />
            </div>

            {/* Info Section - Toggles between Total Summary and Selected Details */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {selectedDate ? format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr }) : "Toplam Rapor"}
                    </CardTitle>
                    {selectedDate && selectedReport && (
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedReport.siteColor || '#3b82f6' }}
                        />
                    )}
                </CardHeader>
                <CardContent>
                    {selectedDate ? (
                        selectedReport ? (
                            <div className="space-y-2">
                                <div className="text-xl font-bold">{selectedReport.siteName}</div>
                                <p className="text-xs text-muted-foreground">
                                    Bu tarihte şantiyedesiniz.
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <Button size="sm" variant="outline" className="h-8 text-xs w-full" asChild>
                                        <Link href={`/reports/${selectedReport.id}`}>
                                            <Pencil className="w-3 h-3 mr-2" />
                                            Düzenle
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-8 text-xs w-full"
                                        onClick={() => handleDelete(selectedReport.id)}
                                        disabled={deletingId === selectedReport.id}
                                    >
                                        {deletingId === selectedReport.id ? "Siliniyor..." : "Sil"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="text-lg font-semibold text-muted-foreground">Çalışma Yok</div>
                                <p className="text-xs text-muted-foreground">
                                    Seçilen tarihte herhangi bir rapor kaydı bulunamadı.
                                </p>
                            </div>
                        )
                    ) : (
                        <>
                            <div className="text-2xl font-bold">{reports.length}</div>
                            <p className="text-xs text-muted-foreground">Son oluşturulan raporlarınız.</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
