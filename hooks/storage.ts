import { Platform } from 'react-native';

let FileSystem: typeof import('expo-file-system') | null = null;
if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system');
}

const DIR = FileSystem?.documentDirectory ? FileSystem.documentDirectory + 'appdata/' : '';

async function ensureDir() {
  if (!FileSystem || !DIR) return;
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

export async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    await ensureDir();
    const path = DIR + key + '.json';
    const info = await FileSystem!.getInfoAsync(path);
    if (!info.exists) return null;
    return await FileSystem!.readAsStringAsync(path);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await ensureDir();
  const path = DIR + key + '.json';
  await FileSystem!.writeAsStringAsync(path, value);
}
