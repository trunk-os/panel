import { Link, Typography } from "@mui/material";
import { parseLinks } from "@/api/errorUtils";
import { Fragment } from "react";

interface TextWithLinksProps {
  text: string;
  variant?: "body1" | "body2" | "caption";
  fontFamily?: string;
  sx?: object;
  color?: string;
  component?: React.ElementType;
}

export function TextWithLinks({
  text,
  variant = "body2",
  fontFamily,
  sx,
  color,
  component,
}: TextWithLinksProps) {
  const parts = parseLinks(text);

  const typographyProps = {
    variant,
    fontFamily,
    sx,
    color,
    ...(component && { component }),
  };

  return (
    <Typography {...typographyProps}>
      {parts.map((part, index) =>
        part.isLink ? (
          <Link
            key={`link-${part.url}-${index}`}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="always"
            sx={{ fontFamily: "inherit" }}
          >
            {part.text}
          </Link>
        ) : (
          <Fragment key={`text-${part.text.slice(0, 10)}-${index}`}>{part.text}</Fragment>
        )
      )}
    </Typography>
  );
}
