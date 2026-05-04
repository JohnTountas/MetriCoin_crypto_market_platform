// PreferencesPanel owns user-controlled assumptions, theme preferences, and workspace utilities.
// It keeps local-first user settings together so backup and restore behavior stays predictable.
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, RefreshCcw, Trash2, Upload } from 'lucide-react';
import { type ChangeEvent, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  createWorkspaceSnapshot,
  useAppStore,
  workspaceSnapshotSchema,
} from '@/app';
import {
  type PortfolioSettingsFormValues,
  portfolioSettingsSchema,
  usePortfolioStore,
} from '@/entities/portfolio';
import { useTheme } from '@/hooks/app';
import { Button, Card, Input, SectionHeading } from '@/shared';

/**
 * PreferencesPanel groups local assumptions, theme preferences, and backup actions.
 * It keeps user-owned workspace settings easy to review without mixing them into ops tooling.
 */
export const PreferencesPanel = () => {
  const settings = usePortfolioStore((state) => state.settings);
  const setSettings = usePortfolioStore((state) => state.setSettings);
  const restoreWorkspaceSnapshot = usePortfolioStore(
    (state) => state.restoreWorkspaceSnapshot,
  );
  const restoreSamplePortfolio = usePortfolioStore(
    (state) => state.restoreSamplePortfolio,
  );
  const clearPortfolioData = usePortfolioStore(
    (state) => state.clearPortfolioData,
  );
  const transactions = usePortfolioStore((state) => state.transactions);
  const alerts = usePortfolioStore((state) => state.alerts);
  const favoriteAssetIds = useAppStore((state) => state.favoriteAssetIds);
  const restoreWorkspacePreferences = useAppStore(
    (state) => state.restoreWorkspacePreferences,
  );
  const pushToast = useAppStore((state) => state.pushToast);
  const { themePreference, setThemePreference } = useTheme();
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<PortfolioSettingsFormValues>({
    resolver: zodResolver(portfolioSettingsSchema),
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

  /**
   * handleSnapshotImport validates a backup before it replaces local workspace data.
   * The validation step keeps older or malformed files from silently corrupting the browser state.
   */
  const handleSnapshotImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    try {
      const fileText = await selectedFile.text();
      const parsedJson = JSON.parse(fileText) as unknown;
      const parsedSnapshot = workspaceSnapshotSchema.safeParse(parsedJson);

      if (!parsedSnapshot.success) {
        pushToast({
          tone: 'error',
          title: 'Import failed',
          description: 'Metricoin could not validate that backup file.',
        });
        return;
      }

      restoreWorkspaceSnapshot({
        settings: parsedSnapshot.data.settings,
        transactions: parsedSnapshot.data.transactions,
        alerts: parsedSnapshot.data.alerts,
      });
      restoreWorkspacePreferences({
        themePreference: parsedSnapshot.data.themePreference,
        favoriteAssetIds: parsedSnapshot.data.favoriteAssetIds,
      });
      pushToast({
        tone: 'success',
        title: 'Workspace restored',
        description:
          `Imported ${parsedSnapshot.data.transactions.length} transaction` +
          `${parsedSnapshot.data.transactions.length === 1 ? '' : 's'}, ` +
          `${parsedSnapshot.data.alerts.length} alert${parsedSnapshot.data.alerts.length === 1 ? '' : 's'}, ` +
          `and ${parsedSnapshot.data.favoriteAssetIds.length} favorite` +
          `${parsedSnapshot.data.favoriteAssetIds.length === 1 ? '' : 's'}.`,
      });
    } catch {
      pushToast({
        tone: 'error',
        title: 'Import failed',
        description: 'The selected file is not valid JSON.',
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="surface p-4 sm:p-5">
        <SectionHeading
          eyebrow="Preferences"
          title="Portfolio assumptions"
          description="Global fee and slippage assumptions feed straight into break-even pricing and total cost impact."
        />

        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => setSettings(values))}
        >
          <label className="space-y-2 text-sm text-[var(--text-secondary)]">
            Estimated trading fee (%)
            <Input
              step="0.01"
              type="number"
              {...form.register('estimatedFeeRate')}
            />
          </label>

          <label className="space-y-2 text-sm text-[var(--text-secondary)]">
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
              Theme
            </p>
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

      <Card className="surface p-4 sm:p-5">
        <SectionHeading
          eyebrow="Operations"
          title="Workspace actions"
          description="Seed demo data, clear the portfolio, or move a versioned workspace backup between machines."
        />

        <div className="mt-6 space-y-4">
          <div className="surface-subtle rounded-2xl p-4 text-sm text-[var(--text-secondary)]">
            <p>Transactions: {transactions.length}</p>
            <p className="mt-1">Alerts: {alerts.length}</p>
            <p className="mt-1">Favorites: {favoriteAssetIds.length}</p>
          </div>

          <input
            accept="application/json,.json"
            className="hidden"
            onChange={handleSnapshotImport}
            ref={importInputRef}
            type="file"
          />

          <Button
            fullWidth
            onClick={() => restoreSamplePortfolio()}
            variant="secondary"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset demo portfolio
          </Button>

          <Button
            fullWidth
            onClick={() => {
              const snapshot = createWorkspaceSnapshot({
                themePreference,
                favoriteAssetIds,
                settings,
                transactions,
                alerts,
              });
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
            onClick={() => importInputRef.current?.click()}
            variant="secondary"
          >
            <Upload className="h-4 w-4" />
            Import snapshot
          </Button>

          <Button
            fullWidth
            onClick={() => clearPortfolioData()}
            variant="danger"
          >
            <Trash2 className="h-4 w-4" />
            Clear local portfolio
          </Button>

          <p className="text-xs leading-6 text-[var(--text-faint)]">
            Snapshot import replaces local transactions, alerts, favorites,
            theme, and calculator assumptions using a validated versioned backup
            file.
          </p>
        </div>
      </Card>
    </div>
  );
};
