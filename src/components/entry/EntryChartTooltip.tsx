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

  const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="z-[60] flex min-w-[150px] max-w-xs flex-col space-y-3 rounded-[8px] border border-gray-200 bg-white p-3 text-sm shadow-lg">
      <span className="text-left text-xs font-medium">{label}</span>

      <div className="flex items-baseline space-x-1">
        <span className="text-xl font-semibold">{totalPoints.toFixed(1)}</span>
        <span className="text-xs opacity-50">Total Point</span>
      </div>

      <div
        className="max-h-16 overflow-auto pr-2"
        onWheel={stopPropagation}
        onMouseDown={stopPropagation}
        onTouchStart={stopPropagation}
      >
        <ul className="list-none space-y-2 pb-2 font-medium">
          {payload
            .filter(
              (item) =>
                item.dataKey !== '_barLow' && item.dataKey !== '_barHigh' && item.dataKey !== '_totalPoints' && item.value > 0,
            )
            .sort((a, b) => b.value - a.value)
            .map((item, index) => (
              <li key={index} className="flex break-words text-xs" style={{ color: item.color }}>
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
