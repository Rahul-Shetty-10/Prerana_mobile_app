export type StorageIdentity = {
  userId: string;
  tenantId: string;
};

export function getStorageKeyForIdentity(baseKey: string, userId: string, tenantId: string): string {
  return `${baseKey}:${encodeURIComponent(userId)}:${encodeURIComponent(tenantId)}`;
}
