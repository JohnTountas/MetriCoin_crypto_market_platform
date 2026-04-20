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

const readCssVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

const getChartPalette = (isDark: boolean) => ({
  textColor: readCssVar('--chart-text', isDark ? '#aab6c5' : '#5b6d81'),
  gridColor: readCssVar('--chart-grid', isDark ? 'rgba(148, 163, 184, 0.03)' : 'rgba(15, 23, 42, 0.055)'),
  crosshairColor: readCssVar('--chart-crosshair', isDark ? 'rgba(93, 127, 143, 0.18)' : 'rgba(28, 99, 113, 0.24)'),
  crosshairSoftColor: readCssVar(
    '--chart-crosshair-soft',
    isDark ? 'rgba(93, 127, 143, 0.12)' : 'rgba(28, 99, 113, 0.14)',
  ),
  positiveColor: readCssVar('--chart-positive', isDark ? '#7eb89b' : '#18805e'),
  positiveFillColor: readCssVar(
    '--chart-positive-fill',
    isDark ? 'rgba(110, 168, 125, 0.20)' : 'rgba(24, 128, 94, 0.16)',
  ),
  positiveFillSoftColor: readCssVar(
    '--chart-positive-fill-soft',
    isDark ? 'rgba(110, 168, 125, 0.03)' : 'rgba(24, 128, 94, 0.03)',
  ),
  negativeColor: readCssVar('--chart-negative', isDark ? '#c9929f' : '#c55a70'),
  negativeFillColor: readCssVar(
    '--chart-negative-fill',
    isDark ? 'rgba(216, 122, 132, 0.18)' : 'rgba(197, 90, 112, 0.14)',
  ),
  negativeFillSoftColor: readCssVar(
    '--chart-negative-fill-soft',
    isDark ? 'rgba(216, 122, 132, 0.05)' : 'rgba(197, 90, 112, 0.03)',
  ),
  baseLineColor: readCssVar('--chart-baseline', isDark ? 'rgba(148, 163, 184, 0.38)' : 'rgba(122, 136, 155, 0.4)'),
});

const getBaselinePalette = (isDark: boolean) => {
  const palette = getChartPalette(isDark);

  return {
    topFillColor1: palette.positiveFillColor,
    topFillColor2: palette.positiveFillSoftColor,
    topLineColor: palette.positiveColor,
    bottomFillColor1: palette.negativeFillSoftColor,
    bottomFillColor2: palette.negativeFillColor,
    bottomLineColor: palette.negativeColor,
    baseLineColor: palette.baseLineColor,
  };
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
        vertLines: { color: readCssVar('--chart-grid', 'rgba(148, 163, 184, 0.03)') },
        horzLines: { color: readCssVar('--chart-grid', 'rgba(148, 163, 184, 0.03)') },
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
          color: readCssVar('--chart-crosshair', 'rgba(93, 127, 143, 0.18)'),
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: readCssVar('--chart-crosshair-soft', 'rgba(93, 127, 143, 0.12)'),
          style: LineStyle.Dashed,
        },
      },
    });

    const baselineSeries = chart.addBaselineSeries({
      ...getBaselinePalette(true),
      baseValue: { type: 'price', price: 0 },
      baseLineVisible: true,
      baseLineStyle: LineStyle.Dashed,
      baseLineWidth: 1,
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: readCssVar('--chart-positive', '#7eb89b'),
      downColor: readCssVar('--chart-negative', '#c9929f'),
      borderVisible: false,
      wickUpColor: readCssVar('--chart-positive', '#7eb89b'),
      wickDownColor: readCssVar('--chart-negative', '#c9929f'),
      priceLineVisible: false,
    });

    chartRef.current = chart;
    baselineSeriesRef.current = baselineSeries;
    candleSeriesRef.current = candleSeries;

    // Theme changes should restyle the existing chart, not destroy it. Reusing
    // the same instance avoids resize races in lightweight-charts.
    const resizeObserver = new ResizeObserver(() => {
      chartRef.current?.timeScale().fitContent();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      baselineSeriesRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    const chart = chartRef.current;
    const baselineSeries = baselineSeriesRef.current;
    const candleSeries = candleSeriesRef.current;

    if (!chart || !baselineSeries || !candleSeries) {
      return;
    }

    const chartPalette = getChartPalette(isDark);

    chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: chartPalette.textColor,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: chartPalette.gridColor },
        horzLines: { color: chartPalette.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: chartPalette.crosshairColor,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: chartPalette.crosshairSoftColor,
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

    baselineSeries.applyOptions({
      ...getBaselinePalette(isDark),
      baseValue: {
        type: 'price',
        price: candles[0]?.open ?? 0,
      },
      baseLineVisible: true,
      baseLineStyle: LineStyle.Dashed,
      baseLineWidth: 1,
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    candleSeries.applyOptions({
      upColor: chartPalette.positiveColor,
      downColor: chartPalette.negativeColor,
      borderVisible: false,
      wickUpColor: chartPalette.positiveColor,
      wickDownColor: chartPalette.negativeColor,
      priceLineVisible: false,
    });
  }, [candles, isDark]);

  useEffect(() => {
    if (!baselineSeriesRef.current || !candleSeriesRef.current) {
      return;
    }

    if (candles.length === 0) {
      baselineSeriesRef.current.setData([]);
      candleSeriesRef.current.setData([]);
      return;
    }

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

