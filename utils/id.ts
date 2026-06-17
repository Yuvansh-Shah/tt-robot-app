import * as Crypto from 'expo-crypto';

export function uid(): string {
  return Crypto.randomUUID();
}
