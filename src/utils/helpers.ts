import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function getBookingStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function getPaymentStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    PARTIAL: 'bg-orange-100 text-orange-800',
    PAID: 'bg-green-100 text-green-800',
    VERIFIED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function generateSeatLayout(capacity: number): string[][] {
  // Returns array of rows, each row is array of seat numbers ('01', '02', etc.) or 'AISLE' or 'DRIVER' or 'EMPTY'
  const seats: string[][] = [];
  let seatNum = 1;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (capacity === 5) {
    // Row 0: DRIVER + 1 passenger (front)
    seats.push(['DRIVER', pad(seatNum++)]);
    // Rows 1-2: 2+1 layout
    seats.push([pad(seatNum++), 'AISLE', pad(seatNum++)]);
    seats.push([pad(seatNum++), 'AISLE', pad(seatNum++)]);
  } else if (capacity === 6) {
    seats.push(['DRIVER', pad(seatNum++)]);
    seats.push([pad(seatNum++), 'AISLE', pad(seatNum++)]);
    seats.push([pad(seatNum++), 'AISLE', pad(seatNum++)]);
    seats.push(['EMPTY', 'AISLE', pad(seatNum++)]);
  } else if (capacity <= 20) {
    // Minibus layout: 2+2 with aisle
    seats.push(['DRIVER', 'EMPTY']);
    while (seatNum <= capacity) {
      const row: string[] = [];
      // Left 2
      row.push(seatNum <= capacity ? pad(seatNum++) : 'EMPTY');
      row.push(seatNum <= capacity ? pad(seatNum++) : 'EMPTY');
      row.push('AISLE');
      // Right 2
      row.push(seatNum <= capacity ? pad(seatNum++) : 'EMPTY');
      row.push(seatNum <= capacity ? pad(seatNum++) : 'EMPTY');
      seats.push(row);
    }
  }

  return seats;
}

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
