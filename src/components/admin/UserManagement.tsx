'use client'

import { useEffect, useState } from 'react'
import { getAllUsers, approveUser, deleteUser, updateUserRole, resetUserPassword, createUser, updateUserDetails, toggleUserStatus } from '@/app/actions/user'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle, XCircle, Trash2, Key, UserPlus, Shield, Edit, UserX, UserCheck } from 'lucide-react'

type User = {
    id: string
    username: string
    name: string | null
    role: string
    approved: boolean
    approvedBy: string | null
    approvedAt: Date | null
    isActive: boolean
    createdAt: Date
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')

    // Dialog states
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId?: string }>({ open: false })
    const [passwordDialog, setPasswordDialog] = useState<{ open: boolean; userId?: string }>({ open: false })
    const [createDialog, setCreateDialog] = useState(false)
    const [roleDialog, setRoleDialog] = useState<{ open: boolean; userId?: string; currentRole?: string }>({ open: false })
    const [editDialog, setEditDialog] = useState<{ open: boolean; user?: User }>({ open: false })
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setLoading(true)
        const result = await getAllUsers()
        if (result.success && result.users) {
            setUsers(result.users as User[])
            if (result.currentUserId) {
                setCurrentUserId(result.currentUserId)
            }
        } else {
            toast.error(result.error || 'Failed to load users')
        }
        setLoading(false)
    }

    async function handleApprove(userId: string) {
        if (userId === currentUserId) return
        const result = await approveUser(userId)
        if (result.success) {
            toast.success('Kullanıcı onaylandı')
            loadUsers()
        } else {
            toast.error(result.error || 'Onaylama başarısız')
        }
    }

    async function handleDelete() {
        if (!deleteDialog.userId) return

        const result = await deleteUser(deleteDialog.userId)
        if (result.success) {
            toast.success('Kullanıcı silindi')
            setDeleteDialog({ open: false })
            loadUsers()
        } else {
            toast.error(result.error || 'Silme başarısız')
        }
    }

    async function handleToggleStatus(userId: string, currentStatus: boolean) {
        const result = await toggleUserStatus(userId, !currentStatus)
        if (result.success) {
            toast.success(`Kullanıcı ${!currentStatus ? 'aktif' : 'pasif'} yapıldı`)
            loadUsers()
        } else {
            toast.error('Durum değiştirilemedi')
        }
    }

    async function handlePasswordReset(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!passwordDialog.userId) return

        const formData = new FormData(e.currentTarget)
        const newPassword = formData.get('newPassword') as string

        const result = await resetUserPassword(passwordDialog.userId, newPassword)
        if (result.success) {
            toast.success('Şifre sıfırlandı')
            setPasswordDialog({ open: false })
        } else {
            toast.error(result.error || 'Şifre sıfırlama başarısız')
        }
    }

    async function handleRoleChange() {
        if (!roleDialog.userId) return

        const formData = new FormData(document.getElementById('roleForm') as HTMLFormElement)
        const newRole = formData.get('role') as 'ADMIN' | 'USER'

        const result = await updateUserRole(roleDialog.userId, newRole)
        if (result.success) {
            toast.success('Rol güncellendi')
            setRoleDialog({ open: false })
            loadUsers()
        } else {
            toast.error(result.error || 'Rol güncelleme başarısız')
        }
    }

    async function handleEditUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!editDialog.user) return

        const formData = new FormData(e.currentTarget)
        const data = {
            username: formData.get('username') as string,
            name: formData.get('name') as string,
        }

        const result = await updateUserDetails(editDialog.user.id, data)
        if (result.success) {
            toast.success('Kullanıcı güncellendi')
            setEditDialog({ open: false })
            loadUsers()
        } else {
            toast.error(result.error || 'Güncelleme başarısız')
        }
    }

    async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const data = {
            username: formData.get('username') as string,
            password: formData.get('password') as string,
            name: formData.get('name') as string,
            role: formData.get('role') as 'ADMIN' | 'USER',
        }

        const result = await createUser(data)
        if (result.success) {
            toast.success('Kullanıcı oluşturuldu')
            setCreateDialog(false)
            loadUsers()
        } else {
            toast.error(result.error || 'Kullanıcı oluşturma başarısız')
        }
    }

    const filteredUsers = users.filter(user => {
        if (filter === 'approved') return user.approved
        if (filter === 'pending') return !user.approved
        return true
    })

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Kullanıcı Yönetimi</CardTitle>
                            <CardDescription>Kullanıcıları yönetin ve onaylayın</CardDescription>
                        </div>
                        <Button onClick={() => setCreateDialog(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Yeni Kullanıcı
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            Tümü ({users.length})
                        </Button>
                        <Button
                            variant={filter === 'approved' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('approved')}
                        >
                            Onaylı ({users.filter(u => u.approved).length})
                        </Button>
                        <Button
                            variant={filter === 'pending' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('pending')}
                        >
                            Bekleyen ({users.filter(u => !u.approved).length})
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Yükleniyor...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kullanıcı Adı</TableHead>
                                    <TableHead>Ad Soyad</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Onay</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} className={!user.isActive ? 'bg-muted/50 opacity-70' : ''}>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.approved ? (
                                                <Badge variant="outline" className="text-green-600 border-green-600 gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Onaylı
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-600 gap-1">
                                                    <XCircle className="h-3 w-3" />
                                                    Bekliyor
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.isActive ? (
                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80">
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="opacity-80">
                                                    Pasif
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-1 justify-end">
                                                {!user.approved && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-green-600"
                                                        title="Onayla"
                                                        onClick={() => handleApprove(user.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    title="Düzenle"
                                                    onClick={() => setEditDialog({ open: true, user })}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    title={user.isActive ? "Pasif Yap" : "Aktif Yap"}
                                                    disabled={user.id === currentUserId}
                                                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                >
                                                    {user.isActive ? <UserX className="h-4 w-4 text-orange-600" /> : <UserCheck className="h-4 w-4 text-green-600" />}
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    title="Rol Değiştir"
                                                    disabled={user.id === currentUserId}
                                                    onClick={() => setRoleDialog({ open: true, userId: user.id, currentRole: user.role })}
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    title="Şifre Sıfırla"
                                                    onClick={() => setPasswordDialog({ open: true, userId: user.id })}
                                                >
                                                    <Key className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive"
                                                    title="Sil"
                                                    disabled={user.id === currentUserId}
                                                    onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, user: undefined })}>
                <DialogContent>
                    <form onSubmit={handleEditUser}>
                        <DialogHeader>
                            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
                            <DialogDescription>
                                Kullanıcı bilgilerini güncelleyin.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="edit-username">Kullanıcı Adı</Label>
                                <Input
                                    id="edit-username"
                                    name="username"
                                    defaultValue={editDialog.user?.username}
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-name">Ad Soyad</Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    defaultValue={editDialog.user?.name || ''}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialog({ open: false })}>
                                İptal
                            </Button>
                            <Button type="submit">Güncelle</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
                        <DialogDescription>
                            Bu kullanıcıyı silmek istediğinizden emin misiniz? <br />
                            <span className="font-bold text-destructive">UYARI: Kullanıcıya ait tüm raporlar ve veriler silinecektir!</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
                            İptal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Reset Dialog */}
            <Dialog open={passwordDialog.open} onOpenChange={(open) => setPasswordDialog({ open })}>
                <DialogContent>
                    <form onSubmit={handlePasswordReset}>
                        <DialogHeader>
                            <DialogTitle>Şifre Sıfırla</DialogTitle>
                            <DialogDescription>
                                Kullanıcı için yeni şifre belirleyin.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="newPassword">Yeni Şifre</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                minLength={4}
                                placeholder="En az 4 karakter"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPasswordDialog({ open: false })}>
                                İptal
                            </Button>
                            <Button type="submit">Şifreyi Sıfırla</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Role Change Dialog */}
            <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog({ open })}>
                <DialogContent>
                    <form id="roleForm">
                        <DialogHeader>
                            <DialogTitle>Rol Değiştir</DialogTitle>
                            <DialogDescription>
                                Kullanıcının rolünü değiştirin.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="role">Rol</Label>
                            <Select name="role" defaultValue={roleDialog.currentRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">Kullanıcı</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRoleDialog({ open: false })}>
                                İptal
                            </Button>
                            <Button type="button" onClick={handleRoleChange}>Güncelle</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogContent>
                    <form onSubmit={handleCreateUser}>
                        <DialogHeader>
                            <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
                            <DialogDescription>
                                Yeni kullanıcı ekleyin (otomatik onaylı).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="create-username">Kullanıcı Adı</Label>
                                <Input
                                    id="create-username"
                                    name="username"
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="create-name">Ad Soyad</Label>
                                <Input
                                    id="create-name"
                                    name="name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="create-password">Şifre</Label>
                                <Input
                                    id="create-password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={4}
                                />
                            </div>
                            <div>
                                <Label htmlFor="create-role">Rol</Label>
                                <Select name="role" defaultValue="USER">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">Kullanıcı</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateDialog(false)}>
                                İptal
                            </Button>
                            <Button type="submit">Oluştur</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
