import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';

interface PortfolioChartProps {
  dataPoint: { time: number; value: number } | null;
}

export function PortfolioChart({ dataPoint }: PortfolioChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize TradingView Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.4)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.4)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const newSeries = chart.addAreaSeries({
      lineColor: '#34d399',
      topColor: 'rgba(52, 211, 153, 0.4)',
      bottomColor: 'rgba(52, 211, 153, 0.0)',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = newSeries;

    // Responsive chart resizing
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart when new data arrives
  useEffect(() => {
    if (dataPoint && seriesRef.current) {
      seriesRef.current.update(dataPoint);
    }
  }, [dataPoint]);

  return (
    <div className="w-full h-96 rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden backdrop-blur-md p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Live Portfolio Valuation</h3>
      <div ref={chartContainerRef} className="w-full h-[calc(100%-2rem)]" />
    </div>
  );
}
