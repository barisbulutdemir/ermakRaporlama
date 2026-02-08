import { getSiteSettings } from '@/app/actions/settings'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AboutPage() {
    const settings = await getSiteSettings()

    return (
        <div className="container mx-auto py-10 px-4 md:px-0 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        {settings?.siteName || 'Hakkımızda'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: settings?.aboutText || '<p>Bilgi bulunamadı.</p>' }}
                    />

                    {(settings?.contactEmail || settings?.contactPhone) && (
                        <div className="mt-8 pt-6 border-t">
                            <h3 className="text-lg font-semibold mb-2">İletişim</h3>
                            {settings.contactEmail && (
                                <p><strong>E-posta:</strong> {settings.contactEmail}</p>
                            )}
                            {settings.contactPhone && (
                                <p><strong>Telefon:</strong> {settings.contactPhone}</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
