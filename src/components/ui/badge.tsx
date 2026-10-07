import * as React from "react";
import { cn } from "@/lib/utils";
import type { CustomerStatus, InvoiceStatus, TicketPriority, TicketStatus } from "@/lib/types";
import {
  customerStatusLabels,
  invoiceStatusLabels,
  ticketPriorityLabels,
  ticketStatusLabels,
} from "@/lib/format";

/** Palet warna badge per status. */
const toneClasses = {
  emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40",
  red: "bg-red-500/15 text-red-300 ring-red-500/40",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
  blue: "bg-blue-500/15 text-blue-300 ring-blue-500/40",
  slate: "bg-slate-500/15 text-slate-300 ring-slate-500/40",
  purple: "bg-purple-500/15 text-purple-300 ring-purple-500/40",
  teal: "bg-teal-500/15 text-teal-300 ring-teal-500/40",
} as const;

type Tone = keyof typeof toneClasses;

export function Badge({
  tone = "slate",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

const customerStatusTone: Record<CustomerStatus, Tone> = {
  ACTIVE: "emerald",
  TRIAL: "teal",
  CANDIDATE: "blue",
  ISOLATED: "red",
  SUSPENDED: "amber",
  TERMINATED: "slate",
};

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge tone={customerStatusTone[status]}>{customerStatusLabels[status]}</Badge>;
}

const invoiceStatusTone: Record<InvoiceStatus, Tone> = {
  PAID: "emerald",
  UNPAID: "amber",
  OVERDUE: "red",
  PARTIAL: "blue",
  VOID: "slate",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge tone={invoiceStatusTone[status]}>{invoiceStatusLabels[status]}</Badge>;
}

const ticketStatusTone: Record<TicketStatus, Tone> = {
  OPEN: "amber",
  IN_PROGRESS: "blue",
  RESOLVED: "emerald",
  CLOSED: "slate",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={ticketStatusTone[status]}>{ticketStatusLabels[status]}</Badge>;
}

const ticketPriorityTone: Record<TicketPriority, Tone> = {
  LOW: "slate",
  MEDIUM: "blue",
  HIGH: "amber",
  CRITICAL: "red",
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge tone={ticketPriorityTone[priority]}>{ticketPriorityLabels[priority]}</Badge>;
}
