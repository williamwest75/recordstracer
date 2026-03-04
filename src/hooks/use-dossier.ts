import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DossierFecData, DossierCourtData, DossierBriefData } from "@/lib/dossier-types";

export function useDossierFec(searchName: string, state: string) {
  return useQuery<DossierFecData>({
    queryKey: ["dossier-fec", searchName, state],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("dossier-fec", {
        body: { searchName, state },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!searchName && searchName.length >= 2,
    staleTime: 1000 * 60 * 30,
  });
}

export function useDossierCourt(searchName: string) {
  return useQuery<DossierCourtData>({
    queryKey: ["dossier-court", searchName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("dossier-courtlistener", {
        body: { searchName },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!searchName && searchName.length >= 2,
    staleTime: 1000 * 60 * 30,
  });
}

export function useDossierBrief(
  searchName: string,
  fecData: DossierFecData | undefined,
  courtData: DossierCourtData | undefined,
  newsData: any[] | undefined
) {
  return useQuery<DossierBriefData>({
    queryKey: ["dossier-brief", searchName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("dossier-brief", {
        body: {
          searchName,
          fecData,
          courtData,
          newsData: newsData || [],
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!searchName && !!fecData && !!courtData,
    staleTime: 1000 * 60 * 30,
  });
}
