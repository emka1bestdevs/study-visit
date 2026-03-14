import { useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField
} from "@mui/material";
import { useProgramSuggestions } from "@/entities/program/model/useProgramSuggestions";
import type { ProgramSuggestion } from "@/shared/types/contracts";

interface ProgramSearchFormProps {
  inputValue: string;
  selectedSuggestion: ProgramSuggestion | null;
  onInputChange: (value: string) => void;
  onSuggestionChange: (value: ProgramSuggestion | null) => void;
  onSubmit: (value: string) => void;
}

export function ProgramSearchForm({
  inputValue,
  selectedSuggestion,
  onInputChange,
  onSuggestionChange,
  onSubmit
}: ProgramSearchFormProps) {
  const { data, isLoading } = useProgramSuggestions(inputValue);

  const options = useMemo(() => data?.items ?? [], [data]);

  function handleSubmit() {
    const program = selectedSuggestion?.name || inputValue;
    if (program.trim().length < 2) {
      return;
    }
    onSubmit(program);
  }

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <Autocomplete
        fullWidth
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        value={selectedSuggestion}
        inputValue={inputValue}
        onChange={(_, value) => onSuggestionChange(value)}
        onInputChange={(_, value, reason) => {
          onInputChange(value);
          if (reason === "input") {
            onSuggestionChange(null);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search by study direction"
            placeholder="Computer Science, Medicine, Law..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
      <Box>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          sx={{ height: "100%", minHeight: 56, px: 3 }}
          onClick={handleSubmit}
        >
          Find Universities
        </Button>
      </Box>
    </Stack>
  );
}
