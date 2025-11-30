'use client';

import { useState, useEffect } from 'react';
import StatsCards from '@/components/dashboard/StatsCards';
import SeverityChart from '@/components/dashboard/SeverityChart';
import NeedsSummary from '@/components/dashboard/NeedsSummary';
import { supabase } from '@/lib/supabase';
import { getSeverityColor, getSeverityLabel } from '@/lib/severity-scoring';
import type { DashboardStats, Assessment, Severity } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_reports: 0,
    severity_distribution: { Low: 0, Moderate: 0, High: 0, Critical: 0 },
    urgent_needs_summary: {},
    district_counts: {},
    high_priority_count: 0,
    active_helpers_count: 0,
  });
  const [highPriority, setHighPriority] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (assessmentsError) throw assessmentsError;

      // Load helpers
      const { data: helpers, error: helpersError } = await supabase
        .from('helpers')
        .select('*')
        .eq('active', true);

      if (helpersError) throw helpersError;

      // Calculate stats
      const severityDistribution: Record<Severity, number> = {
        Low: 0,
        Moderate: 0,
        High: 0,
        Critical: 0,
      };

      const needsSummary: Record<string, number> = {};
      const areaCounts: Record<string, number> = {};
      let highPriorityCount = 0;

      (assessments || []).forEach((assessment: any) => {
        // Severity distribution
        severityDistribution[assessment.severity_score as Severity]++;

        // High priority (Critical + High, unverified)
        if (
          (assessment.severity_score === 'Critical' || assessment.severity_score === 'High') &&
          !assessment.verified
        ) {
          highPriorityCount++;
        }

        // Damaged items (replacing urgent_needs)
        if (assessment.damaged_items && Array.isArray(assessment.damaged_items)) {
          assessment.damaged_items.forEach((item: string) => {
            needsSummary[item] = (needsSummary[item] || 0) + 1;
          });
        }

        // Special needs
        if (assessment.has_elderly) needsSummary['elderly'] = (needsSummary['elderly'] || 0) + 1;
        if (assessment.has_children) needsSummary['children'] = (needsSummary['children'] || 0) + 1;
        if (assessment.has_sick_person) needsSummary['sick_person'] = (needsSummary['sick_person'] || 0) + 1;

        // Area counts (replacing district)
        if (assessment.area) {
          areaCounts[assessment.area] = (areaCounts[assessment.area] || 0) + 1;
        }
      });

      // High priority list
      const highPriorityList = (assessments || [])
        .filter(
          (a: any) =>
            (a.severity_score === 'Critical' || a.severity_score === 'High') && !a.verified
        )
        .slice(0, 10) as Assessment[];

      setStats({
        total_reports: assessments?.length || 0,
        severity_distribution: severityDistribution,
        urgent_needs_summary: needsSummary,
        district_counts: areaCounts, // Using area_counts but keeping field name for compatibility
        high_priority_count: highPriorityCount,
        active_helpers_count: helpers?.length || 0,
      });

      setHighPriority(highPriorityList);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <SeverityChart data={stats.severity_distribution} />
        <NeedsSummary data={stats.urgent_needs_summary} />
      </div>

      {/* Area Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Area Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(stats.district_counts)
            .sort(([, a], [, b]) => b - a)
            .map(([area, count]) => (
              <div key={area} className="p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-gray-900">{area}</p>
                <p className="text-2xl font-bold text-blue-600">{count}</p>
              </div>
            ))}
        </div>
      </div>

      {/* High Priority List */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">High Priority Cases</h3>
        <div className="space-y-3">
          {highPriority.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No high priority cases</p>
          ) : (
            highPriority.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{assessment.name}</h4>
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{
                        backgroundColor: getSeverityColor(assessment.severity_score),
                      }}
                    >
                      {getSeverityLabel(assessment.severity_score, 'en')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {assessment.phone} • {assessment.area || 'Unknown area'}
                  </p>
                  {(assessment.damaged_items && assessment.damaged_items.length > 0) && (
                    <p className="text-sm text-gray-500 mt-1">
                      Damaged: {assessment.damaged_items.join(', ')}
                    </p>
                  )}
                  {(assessment.has_elderly || assessment.has_children || assessment.has_sick_person) && (
                    <p className="text-sm text-gray-500 mt-1">
                      Special needs:{' '}
                      {[
                        assessment.has_elderly && 'Elderly',
                        assessment.has_children && 'Children',
                        assessment.has_sick_person && 'Sick person',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {assessment.special_notes && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {assessment.special_notes}
                    </p>
                  )}
                </div>
                <a
                  href={`/admin/verify?id=${assessment.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Verify
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

