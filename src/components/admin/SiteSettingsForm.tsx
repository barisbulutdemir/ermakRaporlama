'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateSiteSettings } from '@/app/actions/settings'
import { useRouter } from 'next/navigation'

interface SiteSettingsFormProps {
    initialSettings: {
        siteName: string
        description: string
        aboutText: string
        contactEmail?: string
        contactPhone?: string
        enableThemeSwitch: boolean
        debugMode: boolean
    }
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const siteName = formData.get('siteName') as string
        const description = formData.get('description') as string
        const aboutText = formData.get('aboutText') as string
        const contactEmail = formData.get('contactEmail') as string
        const contactPhone = formData.get('contactPhone') as string
        const enableThemeSwitch = formData.get('enableThemeSwitch') === 'true'
        const debugMode = formData.get('debugMode') === 'true'

        const result = await updateSiteSettings({
            siteName,
            description,
            aboutText,
            contactEmail,
            contactPhone,
            enableThemeSwitch,
            debugMode
        })

        if (result.success) {
            toast.success('Ayarlar güncellendi')
            router.refresh()
        } else {
            toast.error('Ayarlar güncellenemedi')
        }

        setLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Site Ayarları (Güncel)</CardTitle>
                <CardDescription>Site başlığı, açıklaması ve hakkımızda yazısını buradan yönetebilirsiniz.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="siteName">Site Adı</Label>
                        <Input
                            id="siteName"
                            name="siteName"
                            defaultValue={initialSettings.siteName}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Site Açıklaması</Label>
                        <Input
                            id="description"
                            name="description"
                            defaultValue={initialSettings.description}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">İletişim E-posta</Label>
                            <Input
                                id="contactEmail"
                                name="contactEmail"
                                type="email"
                                defaultValue={initialSettings.contactEmail || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">İletişim Telefon</Label>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                defaultValue={initialSettings.contactPhone || ''}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="aboutText">Hakkımızda Metni (HTML Destekli)</Label>
                        <Textarea
                            id="aboutText"
                            name="aboutText"
                            defaultValue={initialSettings.aboutText}
                            className="min-h-[200px]"
                        />
                        <p className="text-sm text-muted-foreground">HTML etiketleri kullanabilirsiniz (ör: &lt;p&gt;, &lt;br&gt;, &lt;strong&gt;)</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="enableThemeSwitch"
                            name="enableThemeSwitch"
                            defaultChecked={initialSettings.enableThemeSwitch}
                            value="true"
                        />
                        <Label htmlFor="enableThemeSwitch">Tema Değiştirme Butonunu Göster (Developer Mode)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="debugMode"
                            name="debugMode"
                            defaultChecked={initialSettings.debugMode}
                            value="true"
                        />
                        <Label htmlFor="debugMode">Hata Detaylarını Göster (Debug Mode)</Label>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
