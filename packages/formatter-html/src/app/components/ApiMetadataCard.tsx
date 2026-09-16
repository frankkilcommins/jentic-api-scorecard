import type { ApiMetadata } from '../types.ts';

interface ApiMetadataCardProps {
  apiMetadata: ApiMetadata;
}

export default function ApiMetadataCard({ apiMetadata }: ApiMetadataCardProps) {
  return (
    <div className="flex items-stretch gap-3 pt-6 border-t border-[var(--sc-border)]">
      <StatItem label="OPERATIONS" value={apiMetadata.operationCount} />
      <StatItem label="SCHEMAS" value={apiMetadata.schemaCount} />
      <StatItem label="TAGS" value={apiMetadata.tagCount} />
      <StatItem label="SECURITY SCHEMES" value={apiMetadata.securitySchemeCount} />
      <StatItem label="SECURITY TYPES" value={apiMetadata.securitySchemeTypes?.length ?? 0} />
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: number;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[var(--sc-section)] rounded-lg border border-[var(--sc-border)] min-w-0">
      <div className="min-w-0">
        <div className="text-[10px] text-[var(--sc-text-muted)] uppercase tracking-wide truncate">
          {label}
        </div>
        <div className="text-lg font-bold text-[var(--sc-text-primary)]">{value}</div>
      </div>
    </div>
  );
}
