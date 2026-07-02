import type { SupervisionStatus } from "../lib/questions/schema";

export function LegalBasisBlock({
  legalBasis,
  legalReference,
  supervisionStatus,
}: {
  legalBasis: string;
  legalReference: string;
  supervisionStatus: SupervisionStatus;
}) {
  const label =
    supervisionStatus === "supervised"
      ? "監修済み"
      : supervisionStatus === "in_review"
        ? "監修中"
        : "未監修ドラフト";

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 text-sm">
      <div className="font-medium text-ink">{legalBasis}</div>
      <div className="text-muted">{legalReference}</div>
      <div className="mt-1 text-xs text-muted">監修ステータス: {label}</div>
    </div>
  );
}
