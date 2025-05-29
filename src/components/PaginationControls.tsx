import { Stack, Button, FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";

interface PaginationControlsProps {
  page: number;
  perPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: number[];
}

export default function PaginationControls({
  page,
  perPage,
  hasNextPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [20, 50, 100]
}: PaginationControlsProps) {
  const handlePrevPage = () => {
    if (page > 0) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      onPageChange(page + 1);
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    onPerPageChange(newPerPage);
    onPageChange(0);
  };

  if (page === 0 && !hasNextPage) {
    return null;
  }

  return (
    <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 2 }}>
      <Button variant="outlined" onClick={handlePrevPage} disabled={page <= 0}>
        Previous
      </Button>
      
      <Typography variant="body2" color="text.secondary">
        Page {page + 1}
      </Typography>
      
      <Button variant="outlined" onClick={handleNextPage} disabled={!hasNextPage}>
        Next
      </Button>
      
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Per page</InputLabel>
        <Select
          value={perPage}
          label="Per page"
          onChange={(e) => handlePerPageChange(Number(e.target.value))}
        >
          {perPageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}