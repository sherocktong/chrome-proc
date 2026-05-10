export function padEnd(str: string, length: number): string {
  return str.length >= length ? str : str + " ".repeat(length - str.length);
}

export function padStart(str: string, length: number): string {
  return str.length >= length ? str : " ".repeat(length - str.length) + str;
}
