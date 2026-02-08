'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { authenticate } from '@/app/actions/auth'
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

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Giriş Yap</CardTitle>
                    <CardDescription>Bölge Servis Raporu Sistemi</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Kullanıcı Adı</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        {errorMessage && (
                            <div className="text-sm text-red-500 font-medium">
                                {errorMessage}
                            </div>
                        )}
                        <Button type="submit" className="w-full">
                            Giriş Yap
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Hesabınız yok mu? </span>
                            <Link href="/register" className="text-primary hover:underline">
                                Kayıt Ol
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
