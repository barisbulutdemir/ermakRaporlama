'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/actions/user'

export async function getSiteSettings() {
    const settings = await prisma.siteSettings.findFirst()
    return settings
}

export async function updateSiteSettings(data: {
    siteName: string
    description: string
    aboutText: string
    contactEmail?: string
    contactPhone?: string
    enableThemeSwitch?: boolean
    debugMode?: boolean
}) {
    await requireAdmin()

    try {
        const firstSetting = await prisma.siteSettings.findFirst()

        if (firstSetting) {
            await prisma.siteSettings.update({
                where: { id: firstSetting.id },
                data,
            })
        } else {
            // Should not happen if seeded, but good fallback
            await prisma.siteSettings.create({
                data,
            })
        }

        revalidatePath('/')
        revalidatePath('/about')
        revalidatePath('/admin/settings')
        return { success: true }
    } catch (error) {
        console.error('Failed to update settings:', error)
        return { success: false, error: 'Failed to update settings' }
    }
}
