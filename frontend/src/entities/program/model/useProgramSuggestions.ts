import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/shared/api/httpClient";
import type { ProgramSuggestion } from "@/shared/types/contracts";

interface ProgramSuggestionResponse {
  items: ProgramSuggestion[];
}

export function useProgramSuggestions(query: string) {
  return useQuery({
    queryKey: ["program-suggestions", query],
    queryFn: () =>
      getJson<ProgramSuggestionResponse>(
        `/api/programs?query=${encodeURIComponent(query)}`
      ),
    enabled: query.trim().length >= 2
  });
}
