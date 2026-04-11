"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useGetAdminSalesQuery, useDeleteAdminSaleMutation } from "@/lib/api/adminApi";

interface Sale {
    id: number;
    name: string;
    slug: string;
    description: string;
    heroImage: string;
    isActive: boolean;
    _count?: {
        packages: number;
    };
}

export default function AdminSales() {
    const [searchTerm, setSearchTerm] = useState("");

    // RTK Query hooks
    const { data: salesData, isLoading: loading } = useGetAdminSalesQuery();
    const [deleteSale] = useDeleteAdminSaleMutation();

    // Cast sales data
    const sales = useMemo(() => {
        if (!salesData) return [];
        return salesData as Sale[];
    }, [salesData]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this sale?")) return;

        try {
            await deleteSale(id).unwrap();
        } catch (error) {
            console.error("Failed to delete sale:", error);
        }
    };

    const filteredSales = sales.filter(
        (sale) =>
            sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Sales & Promos
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage sale campaigns and assigned packages
                    </p>
                </div>
                <Link href="/admin/sales/create">
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                        <Plus size={16} />
                        New Sale
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <Card className="border-border">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={18}
                        />
                        <Input
                            placeholder="Search sales..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading sales...</div>
            ) : filteredSales.length === 0 ? (
                <Card className="border-border">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No sales found. Create your first campaign.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSales.map((sale) => (
                        <Card
                            key={sale.id}
                            className={`border-border overflow-hidden hover:shadow-lg transition-shadow pt-0 ${sale.isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}`}
                        >
                            {sale.heroImage && (
                                <div className="h-32 bg-muted relative">
                                    <img
                                        src={sale.heroImage}
                                        alt={sale.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {!sale.isActive && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Badge variant="secondary">Inactive</Badge>
                                        </div>
                                    )}
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-semibold text-lg">{sale.name}</h3>
                                    {sale.isActive ? (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                                    ) : (
                                        <Badge variant="outline">Draft</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    /deals/{sale.slug}
                                </p>
                                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                                    <LinkIcon size={14} />
                                    <span>{sale._count?.packages || 0} Packages</span>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/deals/${sale.slug}`} target="_blank" className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            View Page
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/sales/${sale.id}`} className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1 bg-gray-50 hover:bg-gray-100"
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(sale.id)}
                                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
