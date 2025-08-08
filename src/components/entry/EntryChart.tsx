import { entryInstancesMapAtom, entryTypesArrayAtom } from '@/atoms';
import { chartDateRangeAtom, selectedChartDateAtom } from '@/atoms/app';
import { useIsMounted } from '@/hooks/useIsMounted';
import { getEntryInstanceDateRange } from '@/utils/entry';
import dayjs from 'dayjs';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Brush, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DateRange, EntryInstance, EntryType, barHighValue, barLowValue } from '../../entry/types-constants';
import Segmented from '../segmented';
import { DatePicker } from '../ui/date-picker';
import EntryChartTooltip from './EntryChartTooltip';

const CustomLegend = ({ payload }: { payload?: any[] }) => {
  if (!payload?.length) return null;

  return (
    <div className="chart-legend-scroll mx-6 w-full overflow-x-auto overflow-y-hidden whitespace-nowrap">
      <ul className="inline-flex list-none items-center gap-5 p-0">
        {payload
          .filter((entry) => !entry.dataKey.startsWith('_'))
          .map((entry, index) => (
            <li key={`item-${index}`} className="flex items-center gap-2 whitespace-nowrap text-xs">
              <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="opacity-50">{entry.value}</span>
            </li>
          ))}
      </ul>
    </div>
  );
};
const options = [
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
];
const getChartDataAndAreasFromDaysAndEntriesDateMap = (
  dateRange: string[],
  entryInstancesMap: { [key: string]: EntryInstance[] },
  selectedRange: DateRange,
  entryTypesArray: EntryType[],
) => {
  const allKeys: Set<string> = new Set();
  if (!dateRange?.length) return { areas: [], chartData: [] };
  const chartData = dateRange
    .map((date) => {
      const res: { [key: string]: number | string } = {
        _date: date,
        _barLow: barLowValue[selectedRange],
        _barHigh: barHighValue[selectedRange],
        _totalPoints: 0,
      };
      let entries: EntryInstance[] = [];
      const startDate = dayjs(date);
      switch (selectedRange) {
        case 'month': {
          const endDay = startDate.endOf('month');
          for (let date = startDate; date.isBefore(endDay) || date.isSame(endDay); date = date.add(1, 'day')) {
            const arr = entryInstancesMap?.[date.format('YYYY-MM-DD')];
            if (arr?.length) entries.push(...arr);
          }
          break;
        }
        case 'week': {
          const endDay = startDate.endOf('week');
          for (let date = startDate; date.isBefore(endDay) || date.isSame(endDay); date = date.add(1, 'day')) {
            const arr = entryInstancesMap?.[date.format('YYYY-MM-DD')];
            if (arr?.length) entries.push(...arr);
          }
          break;
        }
        case 'day':
        default:
          entries = entryInstancesMap[date];
      }

      if (!entries?.length) return res;
      entries.forEach((entry) => {
        const { entryTypeId, points } = entry;
        allKeys.add(entryTypeId);
        let nowPoints = points;
        if (typeof points === 'string') nowPoints = parseFloat(points);
        res[entryTypeId] = res[entryTypeId] ? Number(res[entryTypeId]) + nowPoints : nowPoints;
      });
      res._totalPoints = [...allKeys].reduce((total, key) => total + (Number(res[key]) || 0), 0);
      return res;
    })
    .map((dataPoint) => {
      allKeys.forEach((key: string) => {
        dataPoint[key] = dataPoint[key] || 0;
      });
      return dataPoint;
    });
  const areas = [...allKeys.keys()].sort().map((entryTypeId: string) => {
    const entryType = entryTypesArray.find((item) => item.id === entryTypeId);
    const color = entryType?.themeColor ? `#${entryType.themeColor}` : '#000000';

    const props = {
      type: 'linear' as 'linear',
      dataKey: entryTypeId,
      stackId: '3',
      stroke: color,
      fill: color,
      fillOpacity: 0.8,
      dot: false,
    };
    return <Area key={entryTypeId} {...props} />;
  });
  return { areas, chartData };
};

const TotalPointsLabel = (props: any) => {
  const { x, y, value } = props;

  if (value <= 0) {
    return null;
  }

  const tooltipWidth = 40;
  const tooltipHeight = 20;
  const triangleHeight = 5;
  const verticalOffset = 5; // Desplazamiento vertical hacia arriba

  return (
    <g transform={`translate(${x}, ${y})`}>
      <foreignObject
        x={-tooltipWidth / 2}
        y={-(tooltipHeight + triangleHeight + verticalOffset)}
        width={tooltipWidth}
        height={tooltipHeight + triangleHeight}
        style={{ overflow: 'visible' }}
      >
        <div className="flex h-full w-full flex-col items-center">
          <div
            className="flex items-center justify-center rounded-[2px] bg-[#1E1B39] px-2 py-0.5"
            style={{ height: `${tooltipHeight}px` }}
          >
            <span className="text-xs font-medium text-white">{value.toFixed(1)}</span>
          </div>
          <div className="tooltip-arrow-down" />
        </div>
      </foreignObject>
    </g>
  );
};
function EntryChart() {
  const entryInstancesMap = useAtomValue(entryInstancesMapAtom);
  const [selectedRange, setSelectedRange] = useState<DateRange>('day');
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);
  const [dateRange, setDateRange] = useAtom(chartDateRangeAtom);
  const { chartData, areas } = getChartDataAndAreasFromDaysAndEntriesDateMap(
    dateRange,
    entryInstancesMap,
    selectedRange,
    entryTypesArray,
  );
  const [selectedChartDate, setSelectedChartDate] = useAtom(selectedChartDateAtom);
  const isMounted = useIsMounted();

  const dateTicks = useMemo(() => chartData.map((item) => item._date), [chartData]);

  useEffect(() => {
    if (isMounted) {
      setSelectedChartDate(dayjs().format('YYYY-MM-DD'));
    }
  }, [isMounted, setSelectedChartDate]);

  const handleChartClick = useCallback(
    (data: any) => {
      setSelectedChartDate(data?.activeLabel ?? null);
    },
    [setSelectedChartDate],
  );

  useEffect(() => {
    const dates = getEntryInstanceDateRange(entryInstancesMap, selectedRange);
    setDateRange(dates);
  }, [entryInstancesMap, selectedRange, setDateRange]);

  const { startIndex, endIndex } = useMemo(() => {
    let startIndex = Math.max(chartData.length - 7, 0);
    let endIndex = chartData.length - 1;
    const selectedDateStr = selectedChartDate || dayjs().format('YYYY-MM-DD');

    if ((chartData?.length || 0) < 8)
      return {
        startIndex,
        endIndex,
      };
    switch (selectedRange) {
      case 'week': {
        const start = dayjs(selectedDateStr).startOf('week').format('YYYY-MM-DD');
        const idx = chartData.findIndex(({ _date }) => _date === start);
        if (idx === -1) break;
        endIndex = idx;
        startIndex = Math.max(endIndex - 4, 0);
        endIndex = Math.min(startIndex + 4, chartData.length - 1);
        break;
      }
      case 'month': {
        const start = dayjs(selectedDateStr).startOf('month').format('YYYY-MM');
        const idx = chartData.findIndex(({ _date }) => _date === start);
        if (idx === -1) break;
        endIndex = idx;
        startIndex = Math.max(endIndex - 3, 0);
        endIndex = Math.min(startIndex + 3, chartData.length - 1);
        break;
      }
      case 'day':
      default: {
        const idx = chartData.findIndex(({ _date }) => _date === selectedDateStr);
        if (idx === -1) break;
        endIndex = idx;
        startIndex = Math.max(endIndex - 7, 0);
        endIndex = Math.min(startIndex + 7, chartData.length - 1);
        break;
      }
    }
    console.log('=======EntryChart======', { selectedDateStr, startIndex, endIndex, chartData });

    return {
      startIndex,
      endIndex,
    };
  }, [chartData, selectedChartDate, selectedRange]);

  const entryTypesWithData = useMemo(() => {
    const uniqueIds = new Set(areas.map((area) => area.key as string).filter((key) => !key.startsWith('_')));
    return entryTypesArray.filter((et) => uniqueIds.has(et.id));
  }, [areas, entryTypesArray]);

  return (
    <div className="mt-4">
      <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-1">
        <div className="flex-1">
          <Segmented
            defaultValue={selectedRange}
            onChange={(value) => setSelectedRange(value as DateRange)}
            options={options}
            className="bg-transparent p-0 text-sm"
            optionClass="px-[9px] py-3 text-[#8C8A99]"
            selectedClass="font-semibold !text-diary-primary"
            selectedBgClass="bg-[#e4e4e7] rounded-[8px]"
          />
        </div>
        <DatePicker value={selectedChartDate} onChange={setSelectedChartDate} />
      </div>
      <ResponsiveContainer width="100%" height={218}>
        <AreaChart
          onClick={handleChartClick}
          data={chartData}
          margin={{
            top: -12,
            right: 24,
            left: -24,
            bottom: -20,
          }}
        >
          <defs>
            {entryTypesWithData.map((entryType) => (
              <linearGradient key={`gradient-${entryType.id}`} id={`gradient-${entryType.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`#${entryType.themeColor}`} stopOpacity={0.15} />
                <stop offset="95%" stopColor={`#${entryType.themeColor}`} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="_date"
            fontSize={12}
            axisLine={{ stroke: '#CECDD3' }}
            tickLine={false}
            tickFormatter={(date) => dayjs(date).format('MM-DD')}
            ticks={dateTicks}
            textAnchor="middle"
            dy={8}
            height={30}
            interval="preserveStartEnd"
          />
          <YAxis
            padding={{ top: 0, bottom: 0 }}
            type="number"
            domain={[0, 18]}
            fontSize={12}
            axisLine={false}
            tickLine={false}
          />
          <Legend
            verticalAlign="top"
            content={<CustomLegend />}
            wrapperStyle={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '20px' }}
          />
          <Tooltip
            itemStyle={{
              paddingTop: 0,
              paddingBottom: 0,
              height: '18px',
              fontSize: '12px',
              fontWeight: 500,
              textAlign: 'left',
            }}
            wrapperStyle={{
              padding: '12px',
              overflow: 'hidden',
              maxHeight: '200px',
            }}
            cursor={true}
            content={(props) => <EntryChartTooltip {...props} />}
          />
          <Brush className="hidden" dataKey="_date" height={30} startIndex={startIndex} endIndex={endIndex} stroke="#8884d8" />
          <CartesianGrid stroke="#1E1B39" strokeOpacity={0.1} horizontal={true} vertical={false} strokeDasharray="3 3" />
          {entryTypesWithData.map((entryType) => (
            <Area
              key={entryType.id}
              type="linear"
              dataKey={entryType.id}
              stackId="3"
              stroke={`#${entryType.themeColor}`}
              fill={`url(#gradient-${entryType.id})`}
              fillOpacity={1}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
          <Area isAnimationActive={false} type="linear" dataKey="_totalPoints" stroke="none" fill="none" stackId="total">
            <LabelList dataKey="_totalPoints" content={<TotalPointsLabel />} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export default EntryChart;
