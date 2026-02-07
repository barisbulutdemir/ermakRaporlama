'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/app/actions/user'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const username = formData.get('username') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string
        const name = formData.get('name') as string

        // Client-side validation
        if (password !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            toast.error('Şifre en az 6 karakter olmalıdır')
            setLoading(false)
            return
        }

        // Check rate limit (client-side, identifier could be IP on server)
        const identifier = `register_${username}`
        const rateLimit = checkRateLimit(identifier, RATE_LIMITS.register)

        if (!rateLimit.allowed) {
            const minutesLeft = Math.ceil((rateLimit.resetAt - Date.now()) / 60000)
            toast.error(`Çok fazla kayıt denemesi. ${minutesLeft} dakika sonra tekrar deneyin.`)
            setLoading(false)
            return
        }

        const result = await registerUser({ username, password, name })

        if (result.success) {
            setSuccess(true)
            toast.success(result.message || 'Kayıt başarılı!')
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } else {
            toast.error(result.error || 'Kayıt başarısız')
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-green-600">Kayıt Başarılı! ✓</CardTitle>
                        <CardDescription>
                            Hesabınız oluşturuldu. Admin onayı bekleniyor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Hesabınız admin tarafından onaylandıktan sonra giriş yapabileceksiniz.
                            Giriş sayfasına yönlendiriliyorsunuz...
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/login">Giriş Sayfasına Dön</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Kayıt Ol</CardTitle>
                    <CardDescription>Yeni hesap oluştur</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Kullanıcı Adı *</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="kullaniciadi"
                                required
                                minLength={3}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Ad Soyad *</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Adınız Soyadınız"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre *</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="En az 6 karakter"
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Şifrenizi tekrar girin"
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200">
                            ℹ️ Hesabınız oluşturulduktan sonra admin onayı gereklidir.
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
                            <Link href="/login" className="text-primary hover:underline">
                                Giriş Yap
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
