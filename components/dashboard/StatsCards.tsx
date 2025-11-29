'use client';

import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_reports}</p>
          </div>
          <div className="text-4xl">📋</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">High Priority</p>
            <p className="text-3xl font-bold text-red-600">{stats.high_priority_count}</p>
          </div>
          <div className="text-4xl">⚠️</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Active Helpers</p>
            <p className="text-3xl font-bold text-green-600">{stats.active_helpers_count}</p>
          </div>
          <div className="text-4xl">🤝</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Districts Affected</p>
            <p className="text-3xl font-bold text-blue-600">
              {Object.keys(stats.district_counts).length}
            </p>
          </div>
          <div className="text-4xl">🗺️</div>
        </div>
      </div>
    </div>
  );
}

