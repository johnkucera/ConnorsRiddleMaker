import * as FileSystem from 'expo-file-system';

const DIR = FileSystem.documentDirectory + 'appdata/';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

export async function getItem(key: string): Promise<string | null> {
  try {
    await ensureDir();
    const path = DIR + key + '.json';
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    return await FileSystem.readAsStringAsync(path);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  await ensureDir();
  const path = DIR + key + '.json';
  await FileSystem.writeAsStringAsync(path, value);
}
