import { isAfter, isBefore, isSameDay, parseISO } from "date-fns";

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function isOverdue(value: string, today = new Date()) {
  return isBefore(parseISO(value), today);
}

export function isDueToday(value: string, today = new Date()) {
  return isSameDay(parseISO(value), today);
}

export function isUpcoming(value: string, today = new Date()) {
  return isAfter(parseISO(value), today);
}

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sumLineItems(
  items: { qty: number; rate: number }[],
  currency = "USD",
) {
  const total = items.reduce((acc, item) => acc + item.qty * item.rate, 0);
  return formatMoney(total, currency);
}
