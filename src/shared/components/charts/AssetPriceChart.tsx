import {
  type BaselineData,
  type CandlestickData,
  ColorType,
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  LineStyle,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';

import type { MarketCandle } from '@/shared/types';

type AssetPriceChartProps = {
  candles: MarketCandle[];
  theme: 'dark' | 'light';
  mode?: 'area' | 'candles';
  height?: number;
};

const getBaselinePalette = (isDark: boolean) =>
  isDark
    ? {
        topFillColor1: 'rgba(110, 168, 125, 0.20)',
        topFillColor2: 'rgba(110, 168, 125, 0.03)',
        topLineColor: '#6ea87d',
        bottomFillColor1: 'rgba(216, 122, 132, 0.05)',
        bottomFillColor2: 'rgba(216, 122, 132, 0.18)',
        bottomLineColor: '#d87a84',
        baseLineColor: 'rgba(148, 163, 184, 0.38)',
      }
    : {
        topFillColor1: 'rgba(46, 143, 59, 0.18)',
        topFillColor2: 'rgba(46, 143, 59, 0.02)',
        topLineColor: '#2e8f3b',
        bottomFillColor1: 'rgba(255, 90, 95, 0.03)',
        bottomFillColor2: 'rgba(255, 90, 95, 0.16)',
        bottomLineColor: '#ff5a5f',
        baseLineColor: 'rgba(100, 116, 139, 0.45)',
      };

export const AssetPriceChart = ({
  candles,
  theme,
  mode = 'area',
  height = 360,
}: AssetPriceChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const baselineSeriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#aab6c5' : '#334155',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(148, 163, 184, 0.03)' : 'rgba(15, 23, 42, 0.06)' },
        horzLines: { color: isDark ? 'rgba(148, 163, 184, 0.03)' : 'rgba(15, 23, 42, 0.06)' },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? 'rgba(93, 127, 143, 0.16)' : 'rgba(14, 116, 144, 0.26)',
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: isDark ? 'rgba(93, 127, 143, 0.1)' : 'rgba(14, 116, 144, 0.14)',
          style: LineStyle.Dashed,
        },
      },
    });

    const baselineSeries = chart.addBaselineSeries({
      ...getBaselinePalette(isDark),
      baseValue: { type: 'price', price: 0 },
      baseLineVisible: true,
      baseLineStyle: LineStyle.Dashed,
      baseLineWidth: 1,
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: isDark ? '#7eb89b' : '#16a34a',
      downColor: isDark ? '#c9929f' : '#e11d48',
      borderVisible: false,
      wickUpColor: isDark ? '#7eb89b' : '#16a34a',
      wickDownColor: isDark ? '#c9929f' : '#e11d48',
      priceLineVisible: false,
    });

    chartRef.current = chart;
    baselineSeriesRef.current = baselineSeries;
    candleSeriesRef.current = candleSeries;

    const resizeObserver = new ResizeObserver(() => chart.timeScale().fitContent());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      baselineSeriesRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, isDark, theme]);

  useEffect(() => {
    if (!baselineSeriesRef.current || !candleSeriesRef.current || candles.length === 0) return;

    const firstCandle = candles[0];
    const referencePrice = firstCandle.open;
    const baselineData: BaselineData[] = candles.map((candle) => ({
      time: candle.time as UTCTimestamp,
      value: candle.close,
    }));

    const candleData: CandlestickData[] = candles.map((candle) => ({
      time: candle.time as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    baselineSeriesRef.current.applyOptions({
      ...getBaselinePalette(isDark),
      baseValue: { type: 'price', price: referencePrice },
    });
    baselineSeriesRef.current.setData(mode === 'area' ? baselineData : []);
    candleSeriesRef.current.setData(mode === 'candles' ? candleData : []);
    chartRef.current?.timeScale().fitContent();
  }, [candles, isDark, mode]);

  return (
    <div
      className="h-full min-h-[280px] w-full"
      ref={containerRef}
    />
  );
};

