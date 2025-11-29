'use client';

interface NeedsSummaryProps {
  data: Record<string, number>;
}

export default function NeedsSummary({ data }: NeedsSummaryProps) {
  const sortedNeeds = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const maxCount = sortedNeeds.length > 0 ? Math.max(...sortedNeeds.map(([, c]) => c)) : 1;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Needs & Damages Summary</h3>
      <div className="space-y-3">
        {sortedNeeds.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No data available</p>
        ) : (
          sortedNeeds.map(([need, count]) => (
            <div key={need} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {need.replace('_', ' ').replace('-', ' ')}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 text-right">{count}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

