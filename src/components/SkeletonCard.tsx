import { Card, CardContent, Box, Skeleton } from "@mui/material";

interface SkeletonCardProps {
  titleWidth?: number | string;
  contentHeight?: number | string;
  withFooter?: boolean;
  collapsed?: boolean;
}

export default function SkeletonCard({
  titleWidth = 120,
  contentHeight = "75%",
  withFooter = false,
  collapsed = false,
}: SkeletonCardProps) {
  if (collapsed) {
    return (
      <Card sx={{ height: "auto" }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "8px 16px !important",
          }}
        >
          <Skeleton variant="text" width={80} height={24} />
          <Skeleton variant="text" width={60} height={24} sx={{ ml: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Skeleton variant="text" width={titleWidth} height={32} />
        <Box
          sx={{
            mt: 2,
            position: "relative",
            paddingTop: typeof contentHeight === "string" ? contentHeight : undefined,
            height: typeof contentHeight !== "string" ? contentHeight : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: 1,
            }}
          />
        </Box>
        {withFooter && (
          <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
