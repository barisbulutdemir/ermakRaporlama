import { getSiteSettings } from '@/app/actions/settings'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'
import { requireAdmin } from '@/app/actions/user'

export default async function SettingsPage() {
    await requireAdmin()
    const settings = await getSiteSettings()

    if (!settings) {
        return <div>Ayarlar bulunamadı. Lütfen veritabanını kontrol edin.</div>
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Genel Ayarlar</h1>
            <SiteSettingsForm initialSettings={{
                siteName: settings.siteName,
                description: settings.description,
                aboutText: settings.aboutText,
                contactEmail: settings.contactEmail || '',
                contactPhone: settings.contactPhone || '',
                enableThemeSwitch: settings.enableThemeSwitch ?? true,
                debugMode: settings.debugMode ?? false
            }} />
        </div>
    )
}
