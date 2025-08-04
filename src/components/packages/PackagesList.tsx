import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import type { Package } from "@/types/services";

interface PackagesListProps {
  packages: Package[];
  loading: boolean;
  onInstall: (pkg: Package) => void;
}

export function PackagesList({ packages, loading, onInstall }: PackagesListProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (packages.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No packages found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search terms
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {packages.map((pkg) => (
        <Grid item xs={12} sm={6} md={4} key={pkg.name}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="h6" component="h3" noWrap sx={{ flexGrow: 1 }}>
                  {pkg.name}
                </Typography>
                <Chip label={pkg.version} size="small" variant="outlined" />
              </Box>

              {pkg.category && (
                <Chip
                  label={pkg.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrientation: "vertical",
                  minHeight: "3.6em",
                }}
              >
                {pkg.description}
              </Typography>
            </CardContent>

            <CardActions>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => onInstall(pkg)}
                fullWidth
              >
                Install
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
