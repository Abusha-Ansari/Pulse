/**
 * Time and date formatting utilities for Pulse Tracker
 */

export function formatSecondsToHM(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs === 0) {
    if (mins === 0) {
      return `${Math.floor(seconds)}s`;
    }
    return `${mins}m`;
  }
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function formatSecondsToHMS(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }
  return `${secs}s`;
}

export function formatClockTime(isoStringOrDate: string | Date, format24h: boolean = false): string {
  const d = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
  if (isNaN(d.getTime())) return '--:--';

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  if (format24h) {
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${formattedHours}:${formattedMinutes}`;
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${formattedMinutes} ${ampm}`;
}

export function formatHourDisplay(hour: number, format24h: boolean = false): string {
  if (format24h) {
    return `${hour.toString().padStart(2, '0')}:00`;
  }
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function getDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateLabel(dateStr: string): string {
  const todayStr = getDateString(new Date());
  if (dateStr === todayStr) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);
  if (dateStr === yesterdayStr) return 'Yesterday';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return target.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return dateStr;
}
