import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { AssetMeta } from '@/shared/types';
import { classNames } from '@/shared/utils';

import { AssetIcon } from './AssetIcon';

type AssetSelectProps = {
  assets: AssetMeta[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export const AssetSelect = ({
  assets,
  value,
  onChange,
  className,
  disabled = false,
}: AssetSelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedAsset = assets.find((asset) => asset.id === value) ?? assets[0];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  if (!selectedAsset) {
    return null;
  }

  return (
    <div
      className={classNames('relative', className)}
      ref={containerRef}
    >
      <button
        aria-expanded={open}
        className="surface-input flex h-14 w-full items-center justify-between rounded-2xl px-4 text-left text-sm text-[var(--text-primary)] outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }

          setOpen((current) => !current);
        }}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-3">
          <AssetIcon
            asset={selectedAsset}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--text-primary)]">{selectedAsset.name}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-faint)]">{selectedAsset.symbol}</p>
          </div>
        </div>
        <ChevronDown
          className={classNames(
            'h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && !disabled ? (
        <div className="surface absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-[1.5rem] border border-[var(--border)] p-2 shadow-[0_24px_60px_rgba(2,6,23,0.2)]">
          {assets.map((asset) => {
            const active = asset.id === selectedAsset.id;

            return (
              <button
                className={classNames(
                  'surface-hover flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left',
                  active && 'control-option-active',
                )}
                key={asset.id}
                onClick={() => {
                  onChange(asset.id);
                  setOpen(false);
                }}
                type="button"
              >
                <AssetIcon
                  asset={asset}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{asset.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-faint)]">{asset.symbol}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

