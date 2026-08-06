import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import api from '../services/api';
import { DashboardMetrics } from '../types';
import { StatCard } from '../components/StatCard';
import { Truck, CheckCircle2, Calendar, Wrench, ArrowLeftRight, Building2, DollarSign, Fuel, PieChart } from 'lucide-react';

interface DashboardPageProps {
  selectedLocationId?: string;
  onSelectLocation?: (locationId: string) => void;
}

type Timeframe = '1_month' | '3_months' | '1_year' | '3_years';
type FuelViewMode = 'COST' | 'LITERS';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  selectedLocationId = '',
  onSelectLocation,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Timeframe Filters for each chart/table section
  const [combinedTimeframe, setCombinedTimeframe] = useState<Timeframe>('3_months');
  const [fuelTimeframe, setFuelTimeframe] = useState<Timeframe>('3_months');
  const [fuelViewMode, setFuelViewMode] = useState<FuelViewMode>('COST'); // Default to COST (Monetary)
  const [maintenanceTimeframe, setMaintenanceTimeframe] = useState<Timeframe>('3_months');
  const [topSitesTimeframe, setTopSitesTimeframe] = useState<Timeframe>('3_months');

  useEffect(() => {
    fetchDashboard();
  }, [selectedLocationId, combinedTimeframe]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard', {
        params: {
          location_id: selectedLocationId,
          timeframe: combinedTimeframe,
        },
      });
      setMetrics(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
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
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter',
    },
    colors: ['#146C43'],
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
      },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: metrics.combined_expenses_trend?.map((m) => m.month) || [] },
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
    grid: { borderColor: '#E6E6E2', strokeDashArray: 4 },
  };
  const combinedChartSeries = [
    {
      name: 'Combined Expenses',
      data: metrics.combined_expenses_trend?.map((m) => m.total_expense) || [],
    },
  ];

  // 2. Fuel Consumption & Cost Trend Chart (Toggle between Cost IDR [Default] & Liters)
  const isFuelCost = fuelViewMode === 'COST';
  const fuelChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter',
    },
    colors: [isFuelCost ? '#146C43' : '#2563EB'],
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { opacity: 0.15 },
    dataLabels: { enabled: false },
    xaxis: { categories: metrics.fuel_trend?.map((f) => f.month) || [] },
    yaxis: {
      labels: {
        formatter: (val) => (isFuelCost ? formatIDR(val) : `${val.toFixed(1)} L`),
      },
    },
    tooltip: {
      y: {
        formatter: (val) => (isFuelCost ? formatIDR(val) : `${val.toFixed(1)} Liters`),
      },
    },
    grid: { borderColor: '#E6E6E2', strokeDashArray: 4 },
  };
  const fuelChartSeries = [
    {
      name: isFuelCost ? 'Fuel Cost (IDR)' : 'Fuel Volume (Liters)',
      data: metrics.fuel_trend?.map((f) => (isFuelCost ? f.cost : f.liters)) || [],
    },
  ];

  // 3. Maintenance Expenses Trend Chart
  const maintenanceChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter',
    },
    colors: ['#D97706'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: metrics.maintenance_trend?.map((m) => m.month) || [] },
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
    grid: { borderColor: '#E6E6E2', strokeDashArray: 4 },
  };
  const maintenanceChartSeries = [
    {
      name: 'Maintenance Cost',
      data: metrics.maintenance_trend?.map((m) => m.cost) || [],
    },
  ];

  // 4. Expense Outcome Distribution Pie Chart (Fuel % vs Maintenance %)
  const dist = metrics.expense_distribution || { fuel_percentage: 50, maintenance_percentage: 50, fuel_cost: 0, maintenance_cost: 0 };
  const expensePieOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', fontFamily: 'Inter' },
    colors: ['#146C43', '#D97706'],
    labels: [
      `Fuel Expenses (${dist.fuel_percentage}%)`,
      `Maintenance (${dist.maintenance_percentage}%)`,
    ],
    legend: { position: 'bottom' },
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
  const expensePieSeries = [dist.fuel_percentage, dist.maintenance_percentage];

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Vehicles"
          value={metrics.total_vehicles}
          subtitle="Fleet Capacity"
          icon={Truck}
        />
        <StatCard
          title="Available Vehicles"
          value={metrics.available_vehicles}
          subtitle="Ready for Allocation"
          icon={CheckCircle2}
          trend="Active"
          trendType="positive"
        />
        <StatCard
          title="Reserved Vehicles"
          value={metrics.reserved_vehicles}
          subtitle="Active Trip Assignment"
          icon={Calendar}
        />
        <StatCard
          title="Under Maintenance"
          value={metrics.maintenance_vehicles}
          subtitle="Workshop Servicing"
          icon={Wrench}
          trendType="negative"
        />
        <StatCard
          title="Active Transfers"
          value={metrics.in_transfer_vehicles || 0}
          subtitle="Inter-site Reallocation"
          icon={ArrowLeftRight}
        />
      </div>

      {/* Location Summary Cards Grid */}
      {metrics.location_summaries && metrics.location_summaries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Operational Work Sites Summary</h3>
              <p className="text-xs text-[#6B7280]">Select a mine site card to filter full dashboard analytics</p>
            </div>
            {selectedLocationId && onSelectLocation && (
              <button
                onClick={() => onSelectLocation('')}
                className="text-xs font-semibold text-[#146C43] hover:underline"
              >
                Clear Location Filter (Show Global)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.location_summaries.map((loc) => {
              const isSelected = selectedLocationId === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation && onSelectLocation(isSelected ? '' : loc.id)}
                  className={`bg-white border rounded-xl p-5 shadow-2xs cursor-pointer transition-all hover:border-[#146C43] ${
                    isSelected ? 'border-[#146C43] ring-2 ring-[#146C43]/20 bg-emerald-50/20' : 'border-[#E6E6E2]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F5F3] border border-[#E6E6E2] flex items-center justify-center text-[#146C43]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#18181B]">{loc.name}</h4>
                        <p className="text-[11px] text-[#6B7280]">{loc.region}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F5F5F3] text-[#146C43] rounded-md border border-[#E6E6E2]">
                      {loc.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#ECECE8] text-xs">
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Vehicles</span>
                      <span className="font-bold text-[#18181B]">{loc.vehicles} Units</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Drivers</span>
                      <span className="font-bold text-[#18181B]">{loc.drivers} Active</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Pending Approval</span>
                      <span className="font-bold text-amber-700">{loc.pending_approvals} Trips</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Active Transfers</span>
                      <span className="font-bold text-blue-700">{loc.transfers} In Transit</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Row 1: Total Combined Expenses & Expense Outcome Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Combined Expenses Graph (Fuel + Maintenance in IDR) */}
        <div className="card-enterprise lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Total Combined Expenses Trend</h3>
              <p className="text-xs text-[#6B7280]">Aggregate operational spend from fuel & workshop maintenance (IDR)</p>
            </div>
            {/* Timeframe Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#F5F5F3] p-1 rounded-lg border border-[#E6E6E2]">
              {(['3_months', '1_year', '3_years'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setCombinedTimeframe(tf)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    combinedTimeframe === tf
                      ? 'bg-white text-[#146C43] shadow-2xs'
                      : 'text-[#6B7280] hover:text-[#18181B]'
                  }`}
                >
                  {tf === '3_months' ? '3 Months' : tf === '1_year' ? '1 Year' : '3 Years'}
                </button>
              ))}
            </div>
          </div>
          <Chart options={combinedChartOptions} series={combinedChartSeries} type="area" height={290} />
        </div>

        {/* Expense Outcome Distribution Pie Chart */}
        <div className="card-enterprise flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#18181B]">Expense Distribution</h3>
              <PieChart className="w-4 h-4 text-[#146C43]" />
            </div>
            <p className="text-xs text-[#6B7280] mb-4">Percentage split of total fleet operational cost</p>
            <Chart options={expensePieOptions} series={expensePieSeries} type="donut" height={240} />
          </div>
          <div className="border-t border-[#ECECE8] pt-3 mt-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Fuel Spend:</span>
              <span className="font-semibold text-[#146C43]">{formatIDR(dist.fuel_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Maintenance:</span>
              <span className="font-semibold text-[#D97706]">{formatIDR(dist.maintenance_cost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Fuel Trend with Toggle Menu & Maintenance Expenses Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Consumption Trend (Toggle Mode: Monetary IDR [Default] vs Liters) */}
        <div className="card-enterprise">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-[#146C43]" />
                <h3 className="text-base font-bold text-[#18181B]">Fuel Consumption Trend</h3>
              </div>
              <p className="text-xs text-[#6B7280]">Refueling cost and volume over time</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle View Mode Menu Button */}
              <div className="flex items-center bg-[#F5F5F3] p-1 rounded-lg border border-[#E6E6E2]">
                <button
                  onClick={() => setFuelViewMode('COST')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    fuelViewMode === 'COST'
                      ? 'bg-[#146C43] text-white'
                      : 'text-[#6B7280] hover:text-[#18181B]'
                  }`}
                >
                  Cost (IDR)
                </button>
                <button
                  onClick={() => setFuelViewMode('LITERS')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    fuelViewMode === 'LITERS'
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#6B7280] hover:text-[#18181B]'
                  }`}
                >
                  Volume (L)
                </button>
              </div>
            </div>
          </div>

          <Chart options={fuelChartOptions} series={fuelChartSeries} type="area" height={280} />
        </div>

        {/* Maintenance Expenses Graph Chart */}
        <div className="card-enterprise">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-base font-bold text-[#18181B]">Maintenance Expenses</h3>
              </div>
              <p className="text-xs text-[#6B7280]">Workshop repairs and routine servicing costs (IDR)</p>
            </div>
          </div>

          <Chart options={maintenanceChartOptions} series={maintenanceChartSeries} type="bar" height={280} />
        </div>
      </div>

      {/* Row 3: Sites with Most Fuel Money Spent (Replaces Top Utilized Fleet Vehicles) */}
      <div className="card-enterprise">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#146C43]" />
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Sites with Most Fuel Money Spent</h3>
              <p className="text-xs text-[#6B7280]">Work sites ranked by total refueling expenditure</p>
            </div>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#F5F5F3] p-1 rounded-lg border border-[#E6E6E2]">
            {(['1_month', '3_months', '1_year', '3_years'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTopSitesTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  topSitesTimeframe === tf
                    ? 'bg-white text-[#146C43] shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#18181B]'
                }`}
              >
                {tf === '1_month' ? '1 Month' : tf === '3_months' ? '3 Months' : tf === '1_year' ? '1 Year' : '3 Years'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Location Code & Name</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Total Fuel Volume</th>
                <th className="py-3 px-4 text-right">Total Cost (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
              {metrics.top_fuel_sites?.map((site, index) => (
                <tr key={site.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#6B7280]">#{index + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#18181B]">{site.name}</span>
                    <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-[#F5F5F3] text-[#146C43] rounded border border-[#E6E6E2]">
                      {site.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#6B7280]">{site.region}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[#2563EB]">{site.total_liters.toFixed(1)} Liters</td>
                  <td className="py-3 px-4 font-bold text-[#146C43] text-right">{formatIDR(site.total_fuel_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
