"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Mail, Trash2, Search, Download } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useGetAdminNewsletterQuery, useDeleteAdminNewsletterMutation } from "@/lib/api/adminApi"

interface Subscription {
    id: number
    email: string
    subscribedAt: string
}

export default function NewsletterPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteId, setDeleteId] = useState<number | null>(null)

    // RTK Query hooks
    const { data: subscriptions = [], isLoading: loading } = useGetAdminNewsletterQuery()
    const [deleteNewsletter, { isLoading: isDeleting }] = useDeleteAdminNewsletterMutation()

    // Filter subscriptions based on search
    const filteredSubscriptions = useMemo(() => {
        return (subscriptions as Subscription[]).filter((sub) =>
            sub.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery, subscriptions])

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            await deleteNewsletter(deleteId).unwrap()
            setDeleteId(null)
        } catch (error) {
            console.error("Failed to delete subscription:", error)
            alert("Failed to delete subscription")
        }
    }

    const exportToCSV = () => {
        const csv = [
            ["Email", "Subscribed Date"],
            ...filteredSubscriptions.map((sub) => [
                sub.email,
                new Date(sub.subscribedAt).toLocaleDateString(),
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `newsletter-subscriptions-${new Date().toISOString().split("T")[0]}.csv`
        a.click()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Newsletter Subscriptions</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage all newsletter subscribers and contact form submissions
                    </p>
                </div>
                <Button onClick={exportToCSV} variant="outline" className="gap-2">
                    <Download size={16} />
                    Export CSV
                </Button>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <CardTitle>All Subscribers ({filteredSubscriptions.length})</CardTitle>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : filteredSubscriptions.length === 0 ? (
                        <div className="text-center py-12">
                            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "No subscribers found matching your search" : "No subscribers yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Subscribed Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubscriptions.map((subscription) => (
                                        <TableRow key={subscription.id}>
                                            <TableCell className="font-medium">{subscription.email}</TableCell>
                                            <TableCell>
                                                {new Date(subscription.subscribedAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteId(subscription.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this subscription. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
