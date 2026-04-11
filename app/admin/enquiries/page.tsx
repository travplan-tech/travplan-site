"use client"

import { useState } from "react"
import { Search, Filter, Mail, Phone, Calendar, Users, MessageSquare, Trash2, Eye, CheckCircle, Clock, XCircle, ChevronDown, Package, Loader2 } from "lucide-react"
import { useGetAdminEnquiriesQuery, useUpdateAdminEnquiryMutation, useDeleteAdminEnquiryMutation } from "@/lib/api/adminApi"

interface Enquiry {
    id: number
    name: string
    email: string
    phone: string
    packageId: number | null
    packageName: string | null
    preferredDate: string | null
    numberOfTravelers: string | null
    message: string | null
    status: string
    createdAt: string
    updatedAt: string
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    NEW: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
    CONTACTED: { bg: "bg-yellow-100", text: "text-yellow-800", icon: MessageSquare },
    CONVERTED: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
    CLOSED: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle },
}

export default function EnquiriesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    // RTK Query hooks
    const { data: enquiriesData, isLoading: loading, refetch: refetchEnquiries } = useGetAdminEnquiriesQuery()
    const [updateEnquiry] = useUpdateAdminEnquiryMutation()
    const [deleteEnquiryMutation] = useDeleteAdminEnquiryMutation()

    const enquiries: Enquiry[] = (enquiriesData as Enquiry[]) || []

    const updateEnquiryStatus = async (id: number, status: string) => {
        try {
            await updateEnquiry({ id, data: { status } }).unwrap()
            refetchEnquiries()
        } catch (error) {
            console.error("Failed to update enquiry:", error)
        }
    }

    const deleteEnquiry = async (id: number) => {
        if (!confirm("Are you sure you want to delete this enquiry?")) return

        try {
            await deleteEnquiryMutation(id).unwrap()
            refetchEnquiries()
            setShowDetailModal(false)
        } catch (error) {
            console.error("Failed to delete enquiry:", error)
        }
    }

    const filteredEnquiries = enquiries.filter((enquiry) => {
        const matchesSearch =
            enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enquiry.phone.includes(searchQuery) ||
            (enquiry.packageName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

        const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const stats = {
        total: enquiries.length,
        new: enquiries.filter((e) => e.status === "NEW").length,
        contacted: enquiries.filter((e) => e.status === "CONTACTED").length,
        converted: enquiries.filter((e) => e.status === "CONVERTED").length,
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading enquiries...
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
                <p className="text-gray-600">Manage customer enquiries and leads</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Total Enquiries</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <p className="text-sm text-blue-600">New</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                    <p className="text-sm text-yellow-600">Contacted</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.contacted}</p>
                </div>
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <p className="text-sm text-green-600">Converted</p>
                    <p className="text-2xl font-bold text-green-700">{stats.converted}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or package..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All Status</option>
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Package</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Details</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredEnquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        No enquiries found
                                    </td>
                                </tr>
                            ) : (
                                filteredEnquiries.map((enquiry) => {
                                    return (
                                        <tr key={enquiry.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{enquiry.name}</p>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Mail size={14} />
                                                        <span>{enquiry.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Phone size={14} />
                                                        <span>{enquiry.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {enquiry.packageName ? (
                                                    <div className="flex items-center gap-2">
                                                        <Package size={16} className="text-primary" />
                                                        <span className="text-sm">{enquiry.packageName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">General Enquiry</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    {enquiry.preferredDate && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Calendar size={14} />
                                                            <span>{enquiry.preferredDate}</span>
                                                        </div>
                                                    )}
                                                    {enquiry.numberOfTravelers && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Users size={14} />
                                                            <span>{enquiry.numberOfTravelers} travelers</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <select
                                                    value={enquiry.status}
                                                    onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[enquiry.status]?.bg || "bg-gray-100"} ${statusColors[enquiry.status]?.text || "text-gray-800"} border-0 cursor-pointer`}
                                                >
                                                    <option value="NEW">New</option>
                                                    <option value="CONTACTED">Contacted</option>
                                                    <option value="CONVERTED">Converted</option>
                                                    <option value="CLOSED">Closed</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {formatDate(enquiry.createdAt)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEnquiry(enquiry)
                                                            setShowDetailModal(true)
                                                        }}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteEnquiry(enquiry.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedEnquiry && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Enquiry Details</h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <p><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedEnquiry.name}</span></p>
                                    <p><span className="text-gray-500">Email:</span> <a href={`mailto:${selectedEnquiry.email}`} className="text-primary">{selectedEnquiry.email}</a></p>
                                    <p><span className="text-gray-500">Phone:</span> <a href={`tel:${selectedEnquiry.phone}`} className="text-primary">{selectedEnquiry.phone}</a></p>
                                </div>
                            </div>

                            {/* Package Info */}
                            {selectedEnquiry.packageName && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Package Interest</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <p><span className="text-gray-500">Package:</span> <span className="font-medium">{selectedEnquiry.packageName}</span></p>
                                        {selectedEnquiry.preferredDate && (
                                            <p><span className="text-gray-500">Preferred Date:</span> <span className="font-medium">{selectedEnquiry.preferredDate}</span></p>
                                        )}
                                        {selectedEnquiry.numberOfTravelers && (
                                            <p><span className="text-gray-500">Travelers:</span> <span className="font-medium">{selectedEnquiry.numberOfTravelers}</span></p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            {selectedEnquiry.message && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Message</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEnquiry.message}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status & Actions */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Status</h3>
                                <select
                                    value={selectedEnquiry.status}
                                    onChange={(e) => {
                                        updateEnquiryStatus(selectedEnquiry.id, e.target.value)
                                        setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value })
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="NEW">New</option>
                                    <option value="CONTACTED">Contacted</option>
                                    <option value="CONVERTED">Converted</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3">
                                <a
                                    href={`mailto:${selectedEnquiry.email}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                                >
                                    <Mail size={18} />
                                    Send Email
                                </a>
                                <a
                                    href={`tel:${selectedEnquiry.phone}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Phone size={18} />
                                    Call
                                </a>
                            </div>

                            <p className="text-sm text-gray-500 text-center">
                                Received on {formatDate(selectedEnquiry.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
