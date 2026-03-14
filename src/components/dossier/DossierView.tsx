import { useMemo } from "react";
import { useDossierFec, useDossierCourt, useDossierBrief } from "@/hooks/use-dossier";
import { buildTimeline } from "@/lib/timeline-builder";
import DossierBrief from "./DossierBrief";
import DossierTimeline from "./DossierTimeline";
import DossierCampaignFinance from "./DossierCampaignFinance";
import DossierCourtRecords from "./DossierCourtRecords";
import ErrorBoundary from "@/components/ErrorBoundary";
import PublicRecordsLinks from "@/components/search/PublicRecordsLinks";

interface Props {
  searchName: string;
  state: string;
  newsData?: any[];
}

const DossierView = ({ searchName, state, newsData }: Props) => {
  const fecQuery = useDossierFec(searchName, state);
  const courtQuery = useDossierCourt(searchName);
  const briefQuery = useDossierBrief(searchName, fecQuery.data, courtQuery.data, newsData);

  const timelineEvents = useMemo(
    () => buildTimeline(fecQuery.data, courtQuery.data, newsData),
    [fecQuery.data, courtQuery.data, newsData]
  );

  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <DossierBrief data={briefQuery.data} isLoading={briefQuery.isLoading} isError={briefQuery.isError} />
      </ErrorBoundary>

      <ErrorBoundary>
        <DossierTimeline events={timelineEvents} />
      </ErrorBoundary>

      <ErrorBoundary>
        <DossierCampaignFinance data={fecQuery.data} isLoading={fecQuery.isLoading} isError={fecQuery.isError} searchName={searchName} />
      </ErrorBoundary>

      <ErrorBoundary>
        <DossierCourtRecords data={courtQuery.data} isLoading={courtQuery.isLoading} isError={courtQuery.isError} searchName={searchName} />
      </ErrorBoundary>

      <ErrorBoundary>
        <NewsMentions searchQuery={searchName} defaultExpanded />
      </ErrorBoundary>

      <ErrorBoundary>
        <PublicRecordsLinks searchName={searchName} state={state} />
      </ErrorBoundary>
    </div>
  );
};

export default DossierView;
