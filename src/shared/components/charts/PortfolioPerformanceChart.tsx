import {
  type AreaData,
  ColorType,
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  LineStyle,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';

import type { PortfolioPerformancePoint } from '@/shared/types';

type PortfolioPerformanceChartProps = {
  points: PortfolioPerformancePoint[];
  theme: 'dark' | 'light';
  height?: number;
};

const readCssVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

export const PortfolioPerformanceChart = ({
  points,
  theme,
  height = 320,
}: PortfolioPerformanceChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: readCssVar('--chart-text', '#aab6c5'),
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: readCssVar('--chart-grid', 'rgba(148, 163, 184, 0.04)') },
        horzLines: { color: readCssVar('--chart-grid', 'rgba(148, 163, 184, 0.04)') },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: readCssVar('--chart-crosshair', 'rgba(93, 127, 143, 0.18)'),
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: readCssVar('--chart-crosshair-soft', 'rgba(93, 127, 143, 0.12)'),
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: readCssVar('--accent-strong', '#5d7f8f'),
      topColor: readCssVar('--chart-positive-fill', 'rgba(24, 128, 94, 0.16)'),
      bottomColor: readCssVar('--chart-positive-fill-soft', 'rgba(24, 128, 94, 0.03)'),
      lineWidth: 2,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    areaSeriesRef.current = areaSeries;

    // Reusing the chart instance during theme changes prevents teardown timing
    // issues while the surrounding layout is still resizing.
    const resizeObserver = new ResizeObserver(() => {
      chartRef.current?.timeScale().fitContent();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      areaSeriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    const chart = chartRef.current;
    const areaSeries = areaSeriesRef.current;

    if (!chart || !areaSeries) {
      return;
    }

    chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: readCssVar('--chart-text', isDark ? '#aab6c5' : '#5b6d81'),
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: readCssVar('--chart-grid', 'rgba(148, 163, 184, 0.04)') },
        horzLines: { color: readCssVar('--chart-grid', 'rgba(148, 163, 184, 0.04)') },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: readCssVar('--chart-crosshair', 'rgba(93, 127, 143, 0.18)'),
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: readCssVar('--chart-crosshair-soft', 'rgba(93, 127, 143, 0.12)'),
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
    });

    areaSeries.applyOptions({
      lineColor: readCssVar('--accent-strong', isDark ? '#5d7f8f' : '#1c6371'),
      topColor: readCssVar('--chart-positive-fill', 'rgba(24, 128, 94, 0.16)'),
      bottomColor: readCssVar('--chart-positive-fill-soft', 'rgba(24, 128, 94, 0.03)'),
      lineWidth: 2,
      priceLineVisible: false,
    });
  }, [isDark]);

  useEffect(() => {
    if (!areaSeriesRef.current) {
      return;
    }

    const chartData: AreaData[] = points.map((point) => ({
      time: point.time as UTCTimestamp,
      value: point.value,
    }));

    areaSeriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [points]);

  return (
    <div
      className="h-full min-h-[260px] w-full"
      ref={containerRef}
    />
  );
};
