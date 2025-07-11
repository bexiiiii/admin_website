"use client";
import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useApi } from "@/hooks/useApi";

interface SalesData {
    month: string;
    sales: number;
    target: number;
}

export default function MonthlySalesChart() {
    const [data, setData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { getAnalytics } = useApi();

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await getAnalytics();
                if (response && response.salesByMonth && Array.isArray(response.salesByMonth)) {
                    // Transform the data to match the SalesData interface
                    const transformedData = response.salesByMonth.map(item => ({
                        month: item.month,
                        sales: item.amount,
                        target: item.amount * 1.1 // Set target as 10% higher than actual sales
                    }));
                    setData(transformedData);
                } else {
                    // Set default data if no sales data is available
                    setData([
                        { month: 'Jan', sales: 12000, target: 15000 },
                        { month: 'Feb', sales: 14000, target: 16000 },
                        { month: 'Mar', sales: 16000, target: 18000 },
                        { month: 'Apr', sales: 15000, target: 17000 },
                        { month: 'May', sales: 18000, target: 20000 },
                        { month: 'Jun', sales: 20000, target: 22000 }
                    ]);
                }
            } catch (err) {
                console.error('Error fetching sales data:', err);
                // Set default data on error
                setData([
                    { month: 'Jan', sales: 12000, target: 15000 },
                    { month: 'Feb', sales: 14000, target: 16000 },
                    { month: 'Mar', sales: 16000, target: 18000 },
                    { month: 'Apr', sales: 15000, target: 17000 },
                    { month: 'May', sales: 18000, target: 20000 },
                    { month: 'Jun', sales: 20000, target: 22000 }
                ]);
                toast({
                    title: 'Error',
                    description: 'Failed to load sales data',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();
    }, [getAnalytics, toast]);

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
                <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse mb-4" />
                <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Monthly Sales
            </h3>
            <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#8884d8"
                            strokeWidth={2}
                            name="Actual Sales"
                        />
                        <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            name="Target"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

