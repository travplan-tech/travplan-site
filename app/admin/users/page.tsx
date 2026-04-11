"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Search, Filter, UserCog, Mail, Calendar, Loader2 } from "lucide-react"
import { useGetAdminUsersQuery, useUpdateAdminUserMutation, useDeleteAdminUserMutation } from "@/lib/api/adminApi"

interface User {
    id: number
    name: string
    email: string
    role: string
    createdAt: string
    _count?: {
        bookings: number
        reviews: number
    }
}

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("ALL")

    // RTK Query hooks
    const { data: usersData, isLoading: loading, refetch: refetchUsers } = useGetAdminUsersQuery({})
    const [updateUser] = useUpdateAdminUserMutation()
    const [deleteUserMutation] = useDeleteAdminUserMutation()

    const users: User[] = (usersData as User[]) || []

    const updateUserRole = async (userId: number, newRole: string) => {
        try {
            await updateUser({ id: userId, role: newRole }).unwrap()
            refetchUsers()
        } catch (error) {
            console.error("Failed to update user role:", error)
        }
    }

    const deleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

        try {
            await deleteUserMutation(userId).unwrap()
            refetchUsers()
        } catch (error) {
            console.error("Failed to delete user:", error)
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-purple-100 text-purple-800 border-purple-200"
            case "USER":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
                    <p className="text-muted-foreground mt-2">Manage all registered users</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-foreground">{users.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Admin Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-foreground">
                            {users.filter((u) => u.role === "ADMIN").length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Regular Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-foreground">
                            {users.filter((u) => u.role === "USER").length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                size={18}
                            />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter size={16} className="mr-2" />
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading users...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No users found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                            ID
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                            User
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                            Role
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                            Activity
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                            Joined
                                        </th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                                            <td className="p-4 text-sm text-foreground">#{user.id}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {user.name || "No name"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Mail size={12} />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-foreground">
                                                    <p>{user._count?.bookings || 0} bookings</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user._count?.reviews || 0} reviews
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-foreground flex items-center gap-1">
                                                    <Calendar size={14} className="text-muted-foreground" />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value) => updateUserRole(user.id, value)}
                                                    >
                                                        <SelectTrigger className="w-[120px] h-8 text-xs">
                                                            <UserCog size={14} className="mr-1" />
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="USER">User</SelectItem>
                                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => deleteUser(user.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
