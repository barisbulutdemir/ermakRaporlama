'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export function PrintButton() {
    const handleDownloadPDF = async () => {
        const element = document.querySelector('.print-container') as HTMLElement
        if (!element) return

        try {
            // Hide no-print elements
            const noPrintElements = document.querySelectorAll('.no-print')
            noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none')

            // Capture the element as canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff', // Force white background
                width: element.offsetWidth,
                height: element.offsetHeight,
                windowWidth: element.scrollWidth, // Prevent responsive layout shifts
                windowHeight: element.scrollHeight
            })

            // Show no-print elements again
            noPrintElements.forEach(el => (el as HTMLElement).style.display = '')

            // Calculate dimensions
            const PAGE_WIDTH = 210 // A4 width in mm
            const PAGE_HEIGHT = 297 // A4 height in mm
            const MARGIN = 10 // 10mm margin
            const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - (MARGIN * 2) // Safe printable area height

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            // Create PDF (Standard A4)
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgData = canvas.toDataURL('image/png')

            // FORCE FIT TO SINGLE PAGE
            let finalWidth = imgWidth
            let finalHeight = imgHeight

            // If content is taller than safe area, scale it down
            if (finalHeight > MAX_CONTENT_HEIGHT) {
                const ratio = MAX_CONTENT_HEIGHT / finalHeight
                finalWidth = imgWidth * ratio
                finalHeight = MAX_CONTENT_HEIGHT
            }

            // Start at top margin to avoid cutting off header
            // Center horizontally if scaled down width < A4 width
            const x = (PAGE_WIDTH - finalWidth) / 2
            const y = MARGIN

            // Add image with calculated dimensions
            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)

            // SAFETY: Delete extra pages if any (just in case)
            while (pdf.getNumberOfPages() > 1) {
                pdf.deletePage(2)
            }

            // Download with timestamp to prevent caching
            pdf.save(`servis-raporu-${Date.now()}.pdf`)
        } catch (error) {
            console.error('PDF oluşturma hatası:', error)
            alert('PDF oluşturulurken bir hata oluştu')
        }
    }

    return (
        <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" /> PDF İndir
        </Button>
    )
}
