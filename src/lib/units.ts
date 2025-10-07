import { sprintf } from "sprintf-js";

export function toGB(m) {
  return `${sprintf("%0.02f", m / (1024 * 1024 * 1024))}GB`;
}

export function toTB(m) {
  return `${sprintf("%0.02f", m / (1024 * 1024 * 1024 * 1024))}TB`;
}
