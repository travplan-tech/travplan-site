"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Trash2, Search, MailOpen, Clock, User, Phone } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useGetAdminContactsQuery, useUpdateAdminContactMutation, useDeleteAdminContactMutation } from "@/lib/api/adminApi"

interface ContactMessage {
    id: number
    fullName: string
    email: string
    phone: string
    message: string
    status: string
    createdAt: string
    updatedAt: string
}

export default function ContactMessagesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    // RTK Query hooks
    const { data: messages = [], isLoading: loading } = useGetAdminContactsQuery()
    const [updateContact] = useUpdateAdminContactMutation()
    const [deleteContact, { isLoading: isDeleting }] = useDeleteAdminContactMutation()

    // Filter messages
    const filteredMessages = useMemo(() => {
        let filtered = messages as ContactMessage[]

        if (searchQuery) {
            filtered = filtered.filter(
                (msg) =>
                    msg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (statusFilter !== "ALL") {
            filtered = filtered.filter((msg) => msg.status === statusFilter)
        }

        return filtered
    }, [searchQuery, statusFilter, messages])

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await updateContact({ id, data: { status: newStatus } }).unwrap()
            if (selectedMessage && selectedMessage.id === id) {
                setSelectedMessage({ ...selectedMessage, status: newStatus })
            }
        } catch (error) {
            console.error("Failed to update status:", error)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            await deleteContact(deleteId).unwrap()
            if (selectedMessage && selectedMessage.id === deleteId) {
                setSelectedMessage(null)
            }
            setDeleteId(null)
        } catch (error) {
            console.error("Failed to delete message:", error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "UNREAD":
                return "bg-blue-50 text-blue-700 border-blue-200"
            case "READ":
                return "bg-gray-50 text-gray-700 border-gray-200"
            case "REPLIED":
                return "bg-green-50 text-green-700 border-green-200"
            default:
                return "bg-gray-50 text-gray-700 border-gray-200"
        }
    }

    const unreadCount = (messages as ContactMessage[]).filter((msg) => msg.status === "UNREAD").length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Contact Messages</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage all customer inquiries and contact form submissions
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-lg px-4 py-2">
                        {unreadCount} Unread
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <Card className="border-border lg:col-span-1">
                    <CardHeader>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    Inbox ({filteredMessages.length})
                                </CardTitle>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Messages</SelectItem>
                                    <SelectItem value="UNREAD">Unread</SelectItem>
                                    <SelectItem value="READ">Read</SelectItem>
                                    <SelectItem value="REPLIED">Replied</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {searchQuery || statusFilter !== "ALL"
                                        ? "No messages found"
                                        : "No messages yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y max-h-[600px] overflow-y-auto">
                                {filteredMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        onClick={() => {
                                            setSelectedMessage(message)
                                            if (message.status === "UNREAD") {
                                                handleStatusChange(message.id, "READ")
                                            }
                                        }}
                                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedMessage?.id === message.id ? "bg-muted" : ""
                                            } ${message.status === "UNREAD" ? "bg-blue-50/50" : ""}`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${message.status === "UNREAD" ? "bg-primary" : "bg-gray-300"}`}></div>
                                                <p className={`font-semibold text-sm ${message.status === "UNREAD" ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {message.fullName}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={`text-xs ${getStatusColor(message.status)}`}>
                                                {message.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate mb-1">
                                            {message.email}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {message.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(message.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Message Detail View */}
                <Card className="border-border lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Message Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedMessage ? (
                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{selectedMessage.fullName}</h3>
                                                <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{selectedMessage.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {new Date(selectedMessage.createdAt).toLocaleDateString("en-US", {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Select
                                            value={selectedMessage.status}
                                            onValueChange={(value) => handleStatusChange(selectedMessage.id, value)}
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UNREAD">Unread</SelectItem>
                                                <SelectItem value="READ">Read</SelectItem>
                                                <SelectItem value="REPLIED">Replied</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteId(selectedMessage.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-3 text-lg">Message</h4>
                                    <div className="bg-muted p-6 rounded-lg">
                                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-3">Quick Actions</h4>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => window.open(`mailto:${selectedMessage.email}`, '_blank')}
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Reply via Email
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigator.clipboard.writeText(selectedMessage.email)}
                                        >
                                            Copy Email
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <MailOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground text-lg">
                                    Select a message to view details
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this message. This action cannot be undone.
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
