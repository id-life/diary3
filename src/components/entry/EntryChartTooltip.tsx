import React, { useMemo } from 'react';

interface EntryChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function EntryChartTooltip({ active, payload, label }: EntryChartTooltipProps) {
  const totalPoints = useMemo(() => {
    if (!active || !payload || !payload.length) {
      return 0;
    }

    return payload
      .filter((item) => item.dataKey !== '_barLow' && item.dataKey !== '_barHigh' && item.dataKey !== '_totalPoints')
      .reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [payload, active]);

  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="flex min-w-[150px] flex-col space-y-3 rounded-[8px] border border-gray-200 bg-white p-3 text-sm shadow-lg">
      <span className="text-left text-xs font-medium">{label}</span>

      <div className="flex items-baseline space-x-1">
        <span className="text-xl font-semibold">{totalPoints.toFixed(1)}</span>
        <span className="text-xs opacity-50">Total Point</span>
      </div>

      <div className="max-h-[150px] overflow-auto pr-2">
        <ul className="list-none space-y-2 font-medium">
          {payload
            .filter(
              (item) =>
                item.dataKey !== '_barLow' && item.dataKey !== '_barHigh' && item.dataKey !== '_totalPoints' && item.value > 0,
            )
            .sort((a, b) => b.value - a.value)
            .map((item, index) => (
              <li key={index} className="flex text-xs" style={{ color: item.color }}>
                <span>{item.name}</span>
                <span className="mx-1">:</span>
                <span>{item.value}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
