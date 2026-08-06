import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import api from '../services/api';
import { DashboardMetrics } from '../types';
import { StatCard } from '../components/StatCard';
import { Truck, CheckCircle2, Calendar, Wrench, Trophy } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
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

  // ApexCharts Configurations
  const monthlyChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter' },
    colors: ['#146C43'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: metrics.monthly_reservations.map((m) => m.month) },
    grid: { borderColor: '#E6E6E2', strokeDashArray: 4 },
  };
  const monthlyChartSeries = [
    { name: 'Reservations', data: metrics.monthly_reservations.map((m) => m.total) },
  ];

  const utilizationChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', fontFamily: 'Inter' },
    colors: ['#146C43', '#2563EB', '#D97706', '#DC2626'],
    labels: metrics.vehicle_utilization.map((u) => u.type),
    legend: { position: 'bottom' },
    dataLabels: { enabled: true },
  };
  const utilizationChartSeries = metrics.vehicle_utilization.map((u) => u.count);

  const fuelChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter' },
    colors: ['#2E7D32'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { opacity: 0.1 },
    xaxis: { categories: metrics.fuel_consumption.map((f) => f.month) },
    grid: { borderColor: '#E6E6E2', strokeDashArray: 4 },
  };
  const fuelChartSeries = [
    { name: 'Fuel Liters', data: metrics.fuel_consumption.map((f) => f.liters) },
  ];

  const statusChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'pie', fontFamily: 'Inter' },
    colors: ['#2E7D32', '#D97706', '#DC2626', '#2563EB'],
    labels: metrics.reservation_status_distribution.map((s) => s.status),
    legend: { position: 'bottom' },
  };
  const statusChartSeries = metrics.reservation_status_distribution.map((s) => s.count);

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value={metrics.total_vehicles}
          subtitle="Mining Fleet Capacity"
          icon={Truck}
        />
        <StatCard
          title="Available Vehicles"
          value={metrics.available_vehicles}
          subtitle="Ready for Allocation"
          icon={CheckCircle2}
          trend="Ready"
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
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Reservation Trend */}
        <div className="card-enterprise lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Monthly Reservation Demand</h3>
              <p className="text-xs text-[#6B7280]">Total approved & requested trips per month</p>
            </div>
          </div>
          <Chart options={monthlyChartOptions} series={monthlyChartSeries} type="bar" height={280} />
        </div>

        {/* Fleet Utilization by Type */}
        <div className="card-enterprise">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Vehicle Utilization</h3>
              <p className="text-xs text-[#6B7280]">Distribution by vehicle type</p>
            </div>
          </div>
          <Chart
            options={utilizationChartOptions}
            series={utilizationChartSeries}
            type="donut"
            height={280}
          />
        </div>
      </div>

      {/* Fuel Consumption & Reservation Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Consumption Trend */}
        <div className="card-enterprise lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Fuel Consumption Trend</h3>
              <p className="text-xs text-[#6B7280]">Fuel volume (Liters) consumed across mine site</p>
            </div>
          </div>
          <Chart options={fuelChartOptions} series={fuelChartSeries} type="area" height={280} />
        </div>

        {/* Reservation Status Breakdown */}
        <div className="card-enterprise">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Reservation Status Breakdown</h3>
              <p className="text-xs text-[#6B7280]">Approval outcomes overview</p>
            </div>
          </div>
          <Chart options={statusChartOptions} series={statusChartSeries} type="pie" height={280} />
        </div>
      </div>

      {/* Top Used Vehicles */}
      <div className="card-enterprise">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-[#146C43]" />
          <div>
            <h3 className="text-base font-bold text-[#18181B]">Top Utilized Fleet Vehicles</h3>
            <p className="text-xs text-[#6B7280]">Vehicles with highest trip frequency</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">Plate Number</th>
                <th className="py-3 px-4">Brand & Model</th>
                <th className="py-3 px-4">Total Trips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECE8] text-sm">
              {metrics.top_used_vehicles.map((v, i) => (
                <tr key={i} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#18181B]">{v.plate_number}</td>
                  <td className="py-3 px-4 text-[#6B7280]">
                    {v.brand} {v.model}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#146C43]">{v.trip_count} Trips</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
