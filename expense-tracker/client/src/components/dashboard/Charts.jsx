import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import { formatDateShort, generateChartColors } from '../../utils/formatters';
import GlassCard from '../common/GlassCard';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { family: 'DM Sans', size: 12 },
        color: '#6b7280',
        usePointStyle: true,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      titleColor: '#1e1b4b',
      bodyColor: '#6b7280',
      borderColor: 'rgba(99,102,241,0.15)',
      borderWidth: 1,
      titleFont: { family: 'Syne', size: 13, weight: 'bold' },
      bodyFont: { family: 'DM Sans', size: 12 },
      padding: 12,
      cornerRadius: 10,
    },
  },
};

// Weekly spending line chart
const WeeklyChart = ({ data }) => {
  const labels = data?.map((d) => formatDateShort(d._id)) || [];
  const values = data?.map((d) => d.total) || [];

  const chartData = {
    labels,
    datasets: [{
      label: 'Daily Spending (₹)',
      data: values,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div style={{ height: 220 }}>
      <Line
        data={chartData}
        options={{
          ...chartDefaults,
          scales: {
            x: {
              grid: { color: 'rgba(99,102,241,0.06)' },
              ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9ca3af' },
            },
            y: {
              grid: { color: 'rgba(99,102,241,0.06)' },
              ticks: {
                font: { family: 'DM Sans', size: 11 },
                color: '#9ca3af',
                callback: (v) => `₹${v.toLocaleString('en-IN')}`,
              },
            },
          },
        }}
      />
    </div>
  );
};

// Category donut chart
const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-indigo-300 text-sm">
        No data yet
      </div>
    );
  }

  const colors = generateChartColors(data.length);

  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [{
      data: data.map((d) => d.total),
      backgroundColor: colors,
      borderColor: colors.map((c) => c.replace('0.8', '1')),
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  return (
    <div style={{ height: 220 }}>
      <Doughnut
        data={chartData}
        options={{
          ...chartDefaults,
          cutout: '65%',
          plugins: {
            ...chartDefaults.plugins,
            legend: {
              ...chartDefaults.plugins.legend,
              position: 'right',
              labels: {
                ...chartDefaults.plugins.legend.labels,
                boxWidth: 10,
                boxHeight: 10,
              },
            },
          },
        }}
      />
    </div>
  );
};

// Type distribution bar chart
const TypeChart = ({ stats }) => {
  const chartData = {
    labels: ['Normal Expenses', 'Loans Given', 'Loans Borrowed'],
    datasets: [{
      label: 'Amount (₹)',
      data: [
        stats?.totalSpent || 0,
        stats?.totalLoanGiven || 0,
        stats?.totalLoanBorrowed || 0,
      ],
      backgroundColor: [
        'rgba(16,185,129,0.75)',
        'rgba(245,158,11,0.75)',
        'rgba(244,63,94,0.75)',
      ],
      borderColor: ['#10b981', '#f59e0b', '#f43f5e'],
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  return (
    <div style={{ height: 220 }}>
      <Bar
        data={chartData}
        options={{
          ...chartDefaults,
          plugins: { ...chartDefaults.plugins, legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'DM Sans', size: 11 }, color: '#9ca3af' },
            },
            y: {
              grid: { color: 'rgba(99,102,241,0.06)' },
              ticks: {
                font: { family: 'DM Sans', size: 11 },
                color: '#9ca3af',
                callback: (v) => `₹${(v / 1000).toFixed(0)}k`,
              },
            },
          },
        }}
      />
    </div>
  );
};

const Charts = () => {
  const { stats, loadingStats } = useApp();

  if (loadingStats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 h-72">
            <div className="skeleton h-4 w-32 rounded mb-4" />
            <div className="skeleton h-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Weekly spending */}
      <GlassCard delay={0.1} className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-indigo-900">Weekly Spending</h3>
            <p className="text-xs text-indigo-400">Last 7 days of normal expenses</p>
          </div>
          <span className="text-2xl">📈</span>
        </div>
        <WeeklyChart data={stats?.weeklyData} />
      </GlassCard>

      {/* Category breakdown */}
      <GlassCard delay={0.2}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-indigo-900">By Category</h3>
            <p className="text-xs text-indigo-400">Expense distribution</p>
          </div>
          <span className="text-2xl">🥧</span>
        </div>
        <CategoryChart data={stats?.categoryBreakdown} />
      </GlassCard>

      {/* Type distribution */}
      <GlassCard delay={0.3} className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-indigo-900">Transaction Types</h3>
            <p className="text-xs text-indigo-400">Total by transaction category</p>
          </div>
          <span className="text-2xl">📊</span>
        </div>
        <TypeChart stats={stats} />
      </GlassCard>
    </div>
  );
};

export default Charts;
