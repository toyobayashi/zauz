export function zip (source: string, target: string, cb: (err: Error | null, size?: number) => void): void
export function zip (source: string, target: string): Promise<number>
export function unzip (zip: string, target: string, cb: (err: Error | null, size?: number) => void): void
export function unzip (zip: string, target: string): Promise<number>
