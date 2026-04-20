import { useMarketStore } from '@/entities/market';
import {
  calculateOpenPositions,
  calculatePortfolioSummary,
  usePortfolioStore,
} from '@/entities/portfolio/model';

export const usePortfolioOverview = () => {
  const snapshots = useMarketStore((state) => state.snapshots);
  const transactions = usePortfolioStore((state) => state.transactions);
  const alerts = usePortfolioStore((state) => state.alerts);
  const settings = usePortfolioStore((state) => state.settings);
  const positions = calculateOpenPositions(transactions, snapshots, settings);
  const summary = calculatePortfolioSummary(positions, settings);
  const bestPerformer = [...positions].sort((left, right) => right.roiPercent - left.roiPercent)[0];
  const worstPerformer = [...positions].sort((left, right) => left.roiPercent - right.roiPercent)[0];

  return {
    transactions,
    alerts,
    settings,
    positions,
    summary,
    bestPerformer,
    worstPerformer,
  };
};


