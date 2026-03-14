import { useState } from "react";
import type { ProgramSuggestion } from "@/shared/types/contracts";

export function useProgramSearchState() {
  const [inputValue, setInputValue] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ProgramSuggestion | null>(null);
  const [submittedProgram, setSubmittedProgram] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  function submitProgram(programValue: string) {
    setSubmittedProgram(programValue.trim());
  }

  return {
    inputValue,
    setInputValue,
    selectedSuggestion,
    setSelectedSuggestion,
    submittedProgram,
    submitProgram,
    selectedCountry,
    setSelectedCountry
  };
}
