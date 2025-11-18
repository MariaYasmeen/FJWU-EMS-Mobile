export function isValidFjwuEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.toLowerCase().trim();
  return lower.endsWith('.fjwu.edu.pk');
}