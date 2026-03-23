import {
  type CandlestickData,
  ColorType,
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  LineStyle,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';

import type { MarketCandle } from '@/shared/types';

type MarketPriceChartProps = {
  candles: MarketCandle[];
  theme: 'dark' | 'light';
  mode?: 'area' | 'candles';
  height?: number;
};

export const MarketPriceChart = ({
  candles,
  theme,
  mode = 'area',
  height = 360,
}: MarketPriceChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme === 'dark' ? '#cbd5e1' : '#334155',
        fontFamily: 'Manrope, sans-serif',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.06)' },
        horzLines: { color: theme === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.06)' },
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
          color: theme === 'dark' ? 'rgba(103, 232, 249, 0.36)' : 'rgba(14, 116, 144, 0.26)',
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: theme === 'dark' ? 'rgba(103, 232, 249, 0.2)' : 'rgba(14, 116, 144, 0.14)',
          style: LineStyle.Dashed,
        },
      },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: '#67e8f9',
      topColor: 'rgba(103, 232, 249, 0.24)',
      bottomColor: 'rgba(103, 232, 249, 0.02)',
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#34d399',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#34d399',
      wickDownColor: '#f87171',
      priceLineVisible: false,
    });

    chartRef.current = chart;
    areaSeriesRef.current = areaSeries;
    candleSeriesRef.current = candleSeries;

    const resizeObserver = new ResizeObserver(() => chart.timeScale().fitContent());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      areaSeriesRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, theme]);

  useEffect(() => {
    if (!areaSeriesRef.current || !candleSeriesRef.current || candles.length === 0) return;

    const lineData: LineData[] = candles.map((candle) => ({
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

    areaSeriesRef.current.setData(mode === 'area' ? lineData : []);
    candleSeriesRef.current.setData(mode === 'candles' ? candleData : []);
    chartRef.current?.timeScale().fitContent();
  }, [candles, mode]);

  return (
    <div
      className="h-full min-h-[280px] w-full"
      ref={containerRef}
    />
  );
};
