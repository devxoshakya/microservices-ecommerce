"use client";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { OrderChartType } from "@repo/types";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ca } from "zod/v4/locales";

const chartConfig = {
    total: {
        label: "Total",
        color: "var(--chart-1)",
    },
    successful: {
        label: "Successful",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

const AppBarChart = ({
    dataPromise,
}: {
    dataPromise: Promise<OrderChartType[]>;
}) => {
    const [chartData, setChartData] = useState<OrderChartType[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dataPromise;
                console.log("Fetched chart data:", data);
                setChartData(data);
            } catch (error) {
                console.log("Error fetching chart data:", error);
            }
        };

        fetchData();
    }, [dataPromise]);

    if (!chartData) return <div>Loading...</div>;

    return (
        <div className="">
            <h1 className="text-lg font-medium mb-6">Total Revenue</h1>
            <ChartContainer
                config={chartConfig}
                className="min-h-[200px] w-full"
            >
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                    <Bar
                        dataKey="successful"
                        fill="var(--color-successful)"
                        radius={4}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    );
};

export default AppBarChart;
