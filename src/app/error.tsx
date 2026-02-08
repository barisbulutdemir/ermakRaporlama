'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/components/providers/settings-provider'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const settings = useSettings()

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 text-center">
            <h2 className="text-2xl font-bold">Bir şeyler ters gitti!</h2>
            <p className="text-muted-foreground">
                Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
            </p>

            {settings.debugMode && (
                <div className="w-full max-w-2xl p-4 mt-4 overflow-auto text-left bg-muted rounded-md border">
                    <p className="font-mono text-xs text-red-500 mb-2 font-bold">{error.name}: {error.message}</p>
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                        {error.stack}
                    </pre>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground mt-2">Digest: {error.digest}</p>
                    )}
                </div>
            )}

            <Button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Tekrar Dene
            </Button>
        </div>
    )
}
