import { zodResolver } from '@hookform/resolvers/zod';
import { Download, RefreshCcw, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useAppStore } from '@/app/appStore';
import { usePortfolioStore } from '@/entities/portfolio/model/portfolioStore';
import { type SettingsFormValues,settingsSchema } from '@/entities/portfolio/model/schemas';
import { useTheme } from '@/hooks/app/useTheme';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { SectionHeading } from '@/shared/components/ui/SectionHeading';

export const PreferencesPanel = () => {
  const settings = usePortfolioStore((state) => state.settings);
  const setSettings = usePortfolioStore((state) => state.setSettings);
  const seedDemoPortfolio = usePortfolioStore((state) => state.seedDemoPortfolio);
  const clearPortfolio = usePortfolioStore((state) => state.clearPortfolio);
  const transactions = usePortfolioStore((state) => state.transactions);
  const alerts = usePortfolioStore((state) => state.alerts);
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const { themePreference, setThemePreference } = useTheme();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      estimatedFeeRate: settings.estimatedFeeRate,
      estimatedSlippageRate: settings.estimatedSlippageRate,
    },
  });

  useEffect(() => {
    form.reset({
      estimatedFeeRate: settings.estimatedFeeRate,
      estimatedSlippageRate: settings.estimatedSlippageRate,
    });
  }, [form, settings.estimatedFeeRate, settings.estimatedSlippageRate]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="surface p-5">
        <SectionHeading
          eyebrow="Preferences"
          title="Portfolio assumptions"
          description="Global fee and slippage assumptions feed straight into break-even pricing and total cost impact."
        />

        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => setSettings(values))}
        >
          <label className="space-y-2 text-sm text-slate-300">
            Estimated trading fee (%)
            <Input
              step="0.01"
              type="number"
              {...form.register('estimatedFeeRate')}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            Estimated slippage (%)
            <Input
              step="0.01"
              type="number"
              {...form.register('estimatedSlippageRate')}
            />
          </label>

          <div className="md:col-span-2">
            <Button type="submit">Save assumptions</Button>
          </div>
        </form>

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Theme</p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setThemePreference('dark')}
                variant={themePreference === 'dark' ? 'primary' : 'secondary'}
              >
                Dark
              </Button>
              <Button
                onClick={() => setThemePreference('light')}
                variant={themePreference === 'light' ? 'primary' : 'secondary'}
              >
                Light
              </Button>
              <Button
                onClick={() => setThemePreference('system')}
                variant={themePreference === 'system' ? 'primary' : 'secondary'}
              >
                System
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="surface p-5">
        <SectionHeading
          eyebrow="Operations"
          title="Workspace actions"
          description="Seed demo data, clear the portfolio, or export a snapshot for sharing and backup."
        />

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            <p>Transactions: {transactions.length}</p>
            <p className="mt-1">Alerts: {alerts.length}</p>
            <p className="mt-1">Favorites: {favoriteAssetIds.length}</p>
          </div>

          <Button
            fullWidth
            onClick={() => seedDemoPortfolio()}
            variant="secondary"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset demo portfolio
          </Button>

          <Button
            fullWidth
            onClick={() => {
              const snapshot = {
                exportedAt: new Date().toISOString(),
                settings,
                transactions,
                alerts,
                favoriteAssetIds,
              };
              const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = 'metricoin-snapshot.json';
              anchor.click();
              URL.revokeObjectURL(url);
            }}
            variant="secondary"
          >
            <Download className="h-4 w-4" />
            Export snapshot
          </Button>

          <Button
            fullWidth
            onClick={() => clearPortfolio()}
            variant="danger"
          >
            <Trash2 className="h-4 w-4" />
            Clear local portfolio
          </Button>
        </div>
      </Card>
    </div>
  );
};
