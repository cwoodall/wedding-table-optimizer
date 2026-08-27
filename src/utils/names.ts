/** Sort key that orders by last name first (e.g. "Jane Smith" -> "smith jane"),
 *  so alphabetical guest listings group by surname the way printed programs do. */
export function lastNameKey(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName.trim().toLowerCase();
  return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(' ')}`.toLowerCase();
}
