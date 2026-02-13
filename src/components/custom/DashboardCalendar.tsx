'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Calendar as CalendarIcon, Clock, MapPin, Building, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { DayClickEventHandler, Modifiers, ModifiersStyles } from 'react-day-picker'

// Type definitions
interface Project {
    id: string
    name: string
    code: string
}

interface User {
    id: string
    name: string | null
}

interface ServiceReport {
    id: string
    reportDate: Date
    startTime: string
    endTime: string
    customerName: string
    location: string
    status: string
    project: Project
    technician: User
}

interface Holiday {
    id: string
    date: Date
    description: string
    isHalfDay: boolean
}

interface DashboardCalendarProps {
    reports: ServiceReport[]
    holidays: Holiday[]
}

export function DashboardCalendar({ reports, holidays }: DashboardCalendarProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedDateReports, setSelectedDateReports] = useState<ServiceReport[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Helper to find reports for a specific date
    const getReportsForDay = (day: Date) => {
        return reports.filter(report => isSameDay(new Date(report.reportDate), day))
    }

    // Handle date selection
    const handleDayClick: DayClickEventHandler = (day, modifiers) => {
        const dayReports = getReportsForDay(day)
        setSelectedDateReports(dayReports)
        setDate(day)

        if (dayReports.length > 0) {
            setIsDialogOpen(true)
        }
    }

    // Custom modifiers for react-day-picker
    const reportModifiers: Modifiers = {
        hasReport: (date) => getReportsForDay(date).length > 0,
        isHoliday: (date) => holidays.some(h => isSameDay(new Date(h.date), date)),
        isHalfDayHoliday: (date) => holidays.some(h => isSameDay(new Date(h.date), date) && h.isHalfDay),
    }

    const reportModifiersStyles: ModifiersStyles = {
        hasReport: {
            fontWeight: 'bold',
            // textDecoration: 'underline', // removed for cleaner look with dot
        },
        isHoliday: {
            color: '#dc2626', // red-600
        },
        isHalfDayHoliday: {
            color: '#ea580c', // orange-600
        }
    }

    // Function to get holiday description
    const getHolidayDescription = (date: Date) => {
        const holiday = holidays.find(h => isSameDay(new Date(h.date), date))
        return holiday ? holiday.description : null
    }

    const getReportForDay = (day: Date) => {
        return reports.find(report => isSameDay(new Date(report.reportDate), day))
    }


    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Rapor Takvimi
                </CardTitle>
                <CardDescription>
                    Rapor ve resmi tatil günleri
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onDayClick={handleDayClick}
                    locale={tr}
                    className="rounded-md border p-2 w-full flex justify-center"
                    modifiers={reportModifiers}
                    modifiersStyles={{
                        selected: { backgroundColor: 'transparent', border: '2px solid var(--primary)', borderRadius: '100%' },
                        ...reportModifiersStyles
                    }}
                    formatters={{
                        formatDay: (date) => {
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

                                    {/* Dots for Reports */}
                                    <div className="flex gap-0.5 h-1.5 justify-center w-full">
                                        {report && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Rapor Var" />
                                        )}
                                        {/* Holidays handled by modifiers but we can verify here too if needed */}
                                    </div>
                                </div>
                            )
                        }
                    }}
                    footer={
                        <div className="mt-4 flex gap-4 text-xs text-muted-foreground justify-center">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>Rapor</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-red-600 font-bold">●</span>
                                <span>Tatil</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-orange-600 font-bold">●</span>
                                <span>Yarım Gün</span>
                            </div>
                        </div>
                    }
                />

                {/* Dialog for listing reports on selected day */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {date && format(date, 'd MMMM yyyy', { locale: tr })} Raporları
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[300px] mt-4 pr-4">
                            {selectedDateReports.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDateReports.map(report => (
                                        <div key={report.id} className="border rounded-lg p-3 space-y-2 relative overflow-hidden">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${report.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`} />

                                            <div className="flex justify-between items-start pl-2">
                                                <div>
                                                    <h4 className="font-semibold text-sm">{report.project.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{report.project.code}</p>
                                                </div>
                                                <Badge variant={report.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-[10px]">
                                                    {report.status === 'COMPLETED' ? 'Tamamlandı' : 'Taslak'}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs pl-2">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    {report.startTime} - {report.endTime}
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <User className="w-3 h-3" />
                                                    {report.technician.name || 'Teknisyen'}
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                                                    <Building className="w-3 h-3" />
                                                    {report.customerName}
                                                </div>
                                            </div>

                                            <div className="pl-2 pt-1">
                                                <Link href={`/reports/${report.id}`} passHref>
                                                    <Button size="sm" variant="outline" className="w-full text-xs h-7">
                                                        Detayları Görüntüle
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p>Bu tarihte rapor bulunmuyor.</p>
                                </div>
                            )}
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
