import type { ProblemDetails } from "./errors";
import { useToastStore, type StoredError } from "@/store/toastStore";

const URL_REGEX = /(https?:\/\/[^\s\[\]]+|\/[^\s\[\]]+)/g;

export function parseLinks(text: string): Array<{ text: string; isLink: boolean; url?: string }> {
  const parts: Array<{ text: string; isLink: boolean; url?: string }> = [];
  let lastIndex = 0;

  text.replace(URL_REGEX, (match, url, index) => {
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), isLink: false });
    }
    parts.push({ text: match, isLink: true, url });
    lastIndex = index + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isLink: false });
  }

  return parts;
}

export function isProblemDetails(error: unknown): error is ProblemDetails {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const obj = error as Record<string, unknown>;
  return (
    typeof obj.type === "string" ||
    typeof obj.title === "string" ||
    typeof obj.detail === "string" ||
    typeof obj.status === "number"
  );
}

function generateErrorId(): string {
  return `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getErrorTitle(error: unknown): string {
  if (isProblemDetails(error)) {
    const problemDetails = error as ProblemDetails;
    return problemDetails.title || "Error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function showErrorToast(error: unknown, skipToast = false): string | null {
  const { showToast, storeError } = useToastStore.getState();

  let storedError: StoredError | null = null;
  const title = getErrorTitle(error);

  if (isProblemDetails(error)) {
    const errorId = generateErrorId();

    storedError = {
      id: errorId,
      timestamp: Date.now(),
      title: error.title,
      detail: error.detail,
      type: error.type,
      status: error.status,
      fullData: error,
    };
  } else if (error instanceof Error) {
    const errorId = generateErrorId();

    storedError = {
      id: errorId,
      timestamp: Date.now(),
      title: "Error",
      detail: error.message,
      fullData: error,
    };
  }

  if (storedError) {
    storeError(storedError);

    if (!skipToast) {
      showToast({
        message: title,
        severity: "error",
        autoHideDuration: 8000,
        errorId: storedError.id,
      });
    }

    return storedError.id;
  }

  if (!skipToast) {
    showToast({
      message: title,
      severity: "error",
      autoHideDuration: 6000,
    });
  }

  return null;
}
