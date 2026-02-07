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
            // Create a "Clean Room" container
            // This isolates the report from dashboard grid/flex layouts
            const cleanContainer = document.createElement('div')
            cleanContainer.style.position = 'absolute'
            cleanContainer.style.top = '-9999px'
            cleanContainer.style.left = '0'
            cleanContainer.style.width = '210mm' // Force A4 width
            cleanContainer.style.backgroundColor = '#ffffff'
            cleanContainer.style.zIndex = '-1'

            // Clone the report content 
            // We clone the NODE to keep event listeners etc (though not needed for print)
            // But we need to make sure styles are applied. 
            // Since we use Tailwind, classes are global.
            const clonedContent = element.cloneNode(true) as HTMLElement

            // Force styles on the cloned content to ensure it fits
            clonedContent.style.width = '100%'
            clonedContent.style.height = 'auto'
            clonedContent.style.maxHeight = '280mm' // Strict limit
            clonedContent.style.overflow = 'hidden'
            clonedContent.style.margin = '0'
            clonedContent.style.padding = '20px'

            // Remove 'print-container' class to avoid any page-specific CSS that might interfere
            // clonedContent.classList.remove('print-container') 

            // Append to body to render
            cleanContainer.appendChild(clonedContent)
            document.body.appendChild(cleanContainer)

            // Hide no-print elements within the clone
            const noPrintElements = cleanContainer.querySelectorAll('.no-print')
            noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none')

            // Capture the CLEAN container
            const canvas = await html2canvas(cleanContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                height: Math.min(cleanContainer.offsetHeight, 1150) // Limit height in pixels (~300mm)
            })

            // Clean up DOM
            document.body.removeChild(cleanContainer)

            // Create PDF (Standard A4)
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            // Add image
            // Note: Since we limited the container to 280mm, it should fit perfectly.
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)

            // SAFETY: Delete extra pages if any
            while (pdf.getNumberOfPages() > 1) {
                pdf.deletePage(2)
            }

            // Download with timestamp
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
