import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import api from "../services/api";
import { DashboardMetrics } from "../types";
import {
    Truck,
    CheckCircle2,
    Calendar,
    Wrench,
    ArrowLeftRight,
    Building2,
    DollarSign,
    Fuel,
    PieChart,
} from "lucide-react";

interface DashboardPageProps {
    selectedLocationId?: string;
    onSelectLocation?: (locationId: string) => void;
}

type Timeframe = "1_month" | "3_months" | "1_year" | "3_years";
type FuelViewMode = "COST" | "LITERS";

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
    selectedLocationId = "",
    onSelectLocation,
}) => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    // Timeframe Filters for chart/table sections
    const [combinedTimeframe, setCombinedTimeframe] =
        useState<Timeframe>("3_months");
    const [fuelViewMode, setFuelViewMode] = useState<FuelViewMode>("COST"); // Default COST (Monetary)
    const [tableTimeframe, setTableTimeframe] = useState<Timeframe>("3_months");

    useEffect(() => {
        fetchDashboard();
    }, [selectedLocationId, combinedTimeframe]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await api.get("/dashboard", {
                params: {
                    location_id: selectedLocationId,
                    timeframe: combinedTimeframe,
                },
            });
            setMetrics(res.data.data);
        } catch (err) {
            console.error("Failed to load dashboard metrics", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !metrics) {
        return (
            <div className="py-12 text-center text-[#6B7280]">
                Loading Mining Fleet Intelligence Dashboard...
            </div>
        );
    }

    // 1. Total Combined Expenses Chart (Fuel + Maintenance in IDR)
    const combinedChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: "area",
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "Inter",
        },
        colors: ["#146C43"],
        stroke: { curve: "smooth", width: 2.5 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.05,
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories:
                metrics.combined_expenses_trend?.map((m) => m.month) || [],
        },
        yaxis: {
            labels: {
                formatter: (val) => formatIDR(val),
            },
        },
        tooltip: {
            y: {
                formatter: (val) => formatIDR(val),
            },
        },
        grid: { borderColor: "#E6E6E2", strokeDashArray: 4 },
    };
    const combinedChartSeries = [
        {
            name: "Combined Expenses",
            data:
                metrics.combined_expenses_trend?.map((m) => m.total_expense) ||
                [],
        },
    ];

    // 2. Fuel Consumption & Cost Trend Chart
    const isFuelCost = fuelViewMode === "COST";
    const fuelChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: "area",
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "Inter",
        },
        colors: [isFuelCost ? "#146C43" : "#2563EB"],
        stroke: { curve: "smooth", width: 2.5 },
        fill: { opacity: 0.15 },
        dataLabels: { enabled: false },
        xaxis: { categories: metrics.fuel_trend?.map((f) => f.month) || [] },
        yaxis: {
            labels: {
                formatter: (val) =>
                    isFuelCost ? formatIDR(val) : `${val.toFixed(1)} L`,
            },
        },
        tooltip: {
            y: {
                formatter: (val) =>
                    isFuelCost ? formatIDR(val) : `${val.toFixed(1)} Liters`,
            },
        },
        grid: { borderColor: "#E6E6E2", strokeDashArray: 4 },
    };
    const fuelChartSeries = [
        {
            name: isFuelCost ? "Fuel Cost (IDR)" : "Fuel Volume (Liters)",
            data:
                metrics.fuel_trend?.map((f) =>
                    isFuelCost ? f.cost : f.liters,
                ) || [],
        },
    ];

    // 3. Maintenance Expenses Trend Chart
    const maintenanceChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: "Inter",
        },
        colors: ["#D97706"],
        plotOptions: { bar: { borderRadius: 4, columnWidth: "40%" } },
        dataLabels: { enabled: false },
        xaxis: {
            categories: metrics.maintenance_trend?.map((m) => m.month) || [],
        },
        yaxis: {
            labels: {
                formatter: (val) => formatIDR(val),
            },
        },
        tooltip: {
            y: {
                formatter: (val) => formatIDR(val),
            },
        },
        grid: { borderColor: "#E6E6E2", strokeDashArray: 4 },
    };
    const maintenanceChartSeries = [
        {
            name: "Maintenance Cost",
            data: metrics.maintenance_trend?.map((m) => m.cost) || [],
        },
    ];

    // 4. Expense Outcome Distribution Pie Chart
    const dist = metrics.expense_distribution || {
        fuel_percentage: 50,
        maintenance_percentage: 50,
        fuel_cost: 0,
        maintenance_cost: 0,
    };
    const expensePieOptions: ApexCharts.ApexOptions = {
        chart: { type: "donut", fontFamily: "Inter" },
        colors: ["#146C43", "#D97706"],
        labels: [
            `Fuel (${dist.fuel_percentage}%)`,
            `Maintenance (${dist.maintenance_percentage}%)`,
        ],
        legend: { position: "bottom" },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${Number(val).toFixed(1)}%`,
        },
        tooltip: {
            y: {
                formatter: (val) => `${val}%`,
            },
        },
    };
    const expensePieSeries = [
        dist.fuel_percentage,
        dist.maintenance_percentage,
    ];

    const selectedSite = metrics.location_summaries?.find(
        (loc) => loc.id === selectedLocationId,
    );

    return (
        <div className="space-y-5">
            {/* 1. Compressed Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white border border-[#E6E6E2] rounded-lg p-3 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                            Total Vehicles
                        </span>
                        <span className="text-lg font-bold text-[#18181B]">
                            {metrics.total_vehicles}
                        </span>
                    </div>
                    <Truck className="w-5 h-5 text-[#146C43]" />
                </div>

                <div className="bg-white border border-[#E6E6E2] rounded-lg p-3 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                            Available
                        </span>
                        <span className="text-lg font-bold text-[#2E7D32]">
                            {metrics.available_vehicles}
                        </span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                </div>

                <div className="bg-white border border-[#E6E6E2] rounded-lg p-3 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                            Reserved
                        </span>
                        <span className="text-lg font-bold text-[#18181B]">
                            {metrics.reserved_vehicles}
                        </span>
                    </div>
                    <Calendar className="w-5 h-5 text-[#146C43]" />
                </div>

                <div className="bg-white border border-[#E6E6E2] rounded-lg p-3 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                            Maintenance
                        </span>
                        <span className="text-lg font-bold text-[#D97706]">
                            {metrics.maintenance_vehicles}
                        </span>
                    </div>
                    <Wrench className="w-5 h-5 text-[#D97706]" />
                </div>

                <div className="bg-white border border-[#E6E6E2] rounded-lg p-3 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                            In Transfer
                        </span>
                        <span className="text-lg font-bold text-[#2563EB]">
                            {metrics.in_transfer_vehicles || 0}
                        </span>
                    </div>
                    <ArrowLeftRight className="w-5 h-5 text-[#2563EB]" />
                </div>
            </div>

            {/* 2. Compressed Mine Sites Summary Strip */}
            {metrics.location_summaries &&
                metrics.location_summaries.length > 0 && (
                    <div className="bg-white border border-[#E6E6E2] rounded-lg p-3 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#18181B] uppercase tracking-wide">
                                Mine Sites Summary (
                                {metrics.location_summaries.length} Active
                                Sites)
                            </span>
                            {selectedLocationId && onSelectLocation && (
                                <button
                                    onClick={() => onSelectLocation("")}
                                    className="text-[11px] font-semibold text-[#146C43] hover:underline"
                                >
                                    Show All Sites (Global View)
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                            {metrics.location_summaries.map((loc) => {
                                const isSelected =
                                    selectedLocationId === loc.id;
                                return (
                                    <div
                                        key={loc.id}
                                        onClick={() =>
                                            onSelectLocation &&
                                            onSelectLocation(
                                                isSelected ? "" : loc.id,
                                            )
                                        }
                                        className={`p-2 rounded-md border text-xs cursor-pointer transition-all ${
                                            isSelected
                                                ? "border-[#146C43] bg-emerald-50/50 font-bold ring-1 ring-[#146C43]"
                                                : "border-[#ECECE8] bg-[#FAFAF8] hover:border-[#146C43]"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-[#18181B] truncate">
                                                {loc.name}
                                            </span>
                                            <span className="text-[10px] text-[#146C43] font-mono">
                                                {loc.code}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-[#6B7280] flex justify-between">
                                            <span>
                                                {loc.vehicles} Veh •{" "}
                                                {loc.drivers} Drv
                                            </span>
                                            {loc.pending_approvals > 0 && (
                                                <span className="font-semibold text-amber-700">
                                                    {loc.pending_approvals} Pnd
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            {/* Row 1: Total Combined Expenses & Expense Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="card-enterprise lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-base font-bold text-[#18181B]">
                                Total Combined Expenses Trend
                            </h3>
                            <p className="text-xs text-[#6B7280]">
                                Operational spend from fuel & workshop
                                maintenance (IDR)
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#F5F5F3] p-1 rounded-lg border border-[#E6E6E2]">
                            {(
                                ["3_months", "1_year", "3_years"] as Timeframe[]
                            ).map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setCombinedTimeframe(tf)}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                        combinedTimeframe === tf
                                            ? "bg-white text-[#146C43] shadow-2xs"
                                            : "text-[#6B7280] hover:text-[#18181B]"
                                    }`}
                                >
                                    {tf === "3_months"
                                        ? "3 Months"
                                        : tf === "1_year"
                                          ? "1 Year"
                                          : "3 Years"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Chart
                        options={combinedChartOptions}
                        series={combinedChartSeries}
                        type="area"
                        height={270}
                    />
                </div>

                <div className="card-enterprise flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-bold text-[#18181B]">
                                Expense Distribution
                            </h3>
                            <PieChart className="w-4 h-4 text-[#146C43]" />
                        </div>
                        <p className="text-xs text-[#6B7280] mb-4">
                            Percentage split of total fleet operational cost
                        </p>
                        <Chart
                            options={expensePieOptions}
                            series={expensePieSeries}
                            type="donut"
                            height={220}
                        />
                    </div>
                    <div className="border-t border-[#ECECE8] pt-3 mt-2 text-xs space-y-1.5">
                        <div className="flex justify-between">
                            <span className="text-[#6B7280]">Fuel Spend:</span>
                            <span className="font-semibold text-[#146C43]">
                                {formatIDR(dist.fuel_cost)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#6B7280]">Maintenance:</span>
                            <span className="font-semibold text-[#D97706]">
                                {formatIDR(dist.maintenance_cost)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Fuel Trend & Maintenance Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card-enterprise">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Fuel className="w-4 h-4 text-[#146C43]" />
                                <h3 className="text-base font-bold text-[#18181B]">
                                    Fuel Consumption Trend
                                </h3>
                            </div>
                            <p className="text-xs text-[#6B7280]">
                                Refueling cost and volume over time
                            </p>
                        </div>
                        <div className="flex items-center bg-[#F5F5F3] p-1 rounded-lg border border-[#E6E6E2]">
                            <button
                                onClick={() => setFuelViewMode("COST")}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                    fuelViewMode === "COST"
                                        ? "bg-[#146C43] text-white"
                                        : "text-[#6B7280] hover:text-[#18181B]"
                                }`}
                            >
                                Cost (IDR)
                            </button>
                            <button
                                onClick={() => setFuelViewMode("LITERS")}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                    fuelViewMode === "LITERS"
                                        ? "bg-[#2563EB] text-white"
                                        : "text-[#6B7280] hover:text-[#18181B]"
                                }`}
                            >
                                Volume (L)
                            </button>
                        </div>
                    </div>
                    <Chart
                        options={fuelChartOptions}
                        series={fuelChartSeries}
                        type="area"
                        height={260}
                    />
                </div>

                <div className="card-enterprise">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-[#D97706]" />
                                <h3 className="text-base font-bold text-[#18181B]">
                                    Maintenance Expenses
                                </h3>
                            </div>
                            <p className="text-xs text-[#6B7280]">
                                Workshop repairs and routine servicing costs
                                (IDR)
                            </p>
                        </div>
                    </div>
                    <Chart
                        options={maintenanceChartOptions}
                        series={maintenanceChartSeries}
                        type="bar"
                        height={260}
                    />
                </div>
            </div>

            {/* Row 3: Contextual Table Card (Top Sites Global vs Top Vehicles Site) */}
            <div className="card-enterprise">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#146C43]" />
                        <div>
                            <h3 className="text-base font-bold text-[#18181B]">
                                {selectedLocationId && selectedSite
                                    ? `Top Vehicles with Most Expenses (${selectedSite.name})`
                                    : "Top Mine Sites by Total Expenses"}
                            </h3>
                            <p className="text-xs text-[#6B7280]">
                                {selectedLocationId
                                    ? "Vehicles ranked by combined fuel and maintenance cost"
                                    : "Mine sites ranked by total combined operational spend (Fuel + Maintenance)"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {selectedLocationId ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
                                    <th className="py-3 px-4">Rank</th>
                                    <th className="py-3 px-4">
                                        Vehicle Plate & Model
                                    </th>
                                    <th className="py-3 px-4">Fuel Cost</th>
                                    <th className="py-3 px-4">
                                        Maintenance Cost
                                    </th>
                                    <th className="py-3 px-4 text-right">
                                        Total Combined Expense (IDR)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
                                {metrics.top_site_vehicles?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-6 text-center text-[#6B7280]"
                                        >
                                            No vehicle expense data recorded for
                                            this site.
                                        </td>
                                    </tr>
                                ) : (
                                    metrics.top_site_vehicles?.map(
                                        (veh, idx) => (
                                            <tr
                                                key={veh.id}
                                                className="hover:bg-[#F5F5F3] transition-colors"
                                            >
                                                <td className="py-3 px-4 font-bold text-[#6B7280]">
                                                    #{idx + 1}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-[#18181B]">
                                                        {veh.plate_number}
                                                    </span>
                                                    <span className="ml-2 text-xs text-[#6B7280]">
                                                        ({veh.brand} {veh.model}
                                                        )
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-xs font-semibold text-[#146C43]">
                                                    {formatIDR(veh.fuel_cost)}
                                                </td>
                                                <td className="py-3 px-4 text-xs font-semibold text-[#D97706]">
                                                    {formatIDR(
                                                        veh.maintenance_cost,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-[#18181B] text-right">
                                                    {formatIDR(
                                                        veh.total_expense,
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
                                    <th className="py-3 px-4">Rank</th>
                                    <th className="py-3 px-4">
                                        Location Code & Name
                                    </th>
                                    <th className="py-3 px-4">Region</th>
                                    <th className="py-3 px-4">Fuel Spend</th>
                                    <th className="py-3 px-4">
                                        Maintenance Spend
                                    </th>
                                    <th className="py-3 px-4 text-right">
                                        Total Combined Expenses (IDR)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
                                {metrics.top_expense_sites?.map(
                                    (site, index) => (
                                        <tr
                                            key={site.id}
                                            className="hover:bg-[#F5F5F3] transition-colors"
                                        >
                                            <td className="py-3 px-4 font-bold text-[#6B7280]">
                                                #{index + 1}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-bold text-[#18181B]">
                                                    {site.name}
                                                </span>
                                                <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-[#F5F5F3] text-[#146C43] rounded border border-[#E6E6E2]">
                                                    {site.code}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-[#6B7280]">
                                                {site.region}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-semibold text-[#146C43]">
                                                {formatIDR(site.fuel_cost)}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-semibold text-[#D97706]">
                                                {formatIDR(
                                                    site.maintenance_cost,
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-[#18181B] text-right">
                                                {formatIDR(site.total_expense)}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
