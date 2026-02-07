import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { UserManagement } from '@/components/admin/UserManagement'

export default async function AdminUsersPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    if (session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div className="mx-auto grid w-full max-w-[1200px] gap-6">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold">Kullanıcı Yönetimi</h1>
            </div>
            <UserManagement />
        </div>
    )
}
