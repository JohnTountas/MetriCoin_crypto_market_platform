import { useState } from 'react';

import { classNames } from '@/shared/utils';
import type { AssetMeta } from '@/shared/types';

type AssetIconProps = {
  asset: AssetMeta;
  size?: number | 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE_MAP = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
} as const;

export const AssetIcon = ({ asset, size = 'md', className }: AssetIconProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const dimension = typeof size === 'number' ? size : SIZE_MAP[size];
  const showImage = Boolean(asset.iconUrl) && !imageFailed;

  return (
    <span
      className={classNames(
        'surface-subtle inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-inset ring-[var(--border-strong)]',
        className,
      )}
      style={{ height: dimension, width: dimension }}
    >
      {showImage ? (
        <img
          alt={`${asset.name} icon`}
          className="h-full w-full object-cover"
          decoding="async"
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={asset.iconUrl}
        />
      ) : (
        <span
          className={classNames(
            'flex h-full w-full items-center justify-center bg-gradient-to-br text-[10px] font-semibold uppercase tracking-[0.12em] text-white',
            asset.accent,
          )}
        >
          {asset.symbol.slice(0, 3)}
        </span>
      )}
    </span>
  );
};

