import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import * as FileSystem from 'expo-file-system';

export async function uploadFile({ uri, file, pathPrefix, uid }) {
  const safeName = (file?.name || `file_${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const fullPath = `${pathPrefix}/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, fullPath);
  let blobOrBytes;
  let contentType = file?.type || 'application/octet-stream';
  if (uri) {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      contentType = blob.type || contentType;
      blobOrBytes = blob;
    } catch {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) throw new Error('File not found');
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const snap = await uploadString(storageRef, b64, 'base64', { contentType });
      const url = await getDownloadURL(snap.ref);
      return { url, path: fullPath };
    }
  } else if (file) {
    blobOrBytes = file;
  } else {
    throw new Error('No file or uri provided');
  }
  const snap = await uploadBytes(storageRef, blobOrBytes, { contentType });
  const url = await getDownloadURL(snap.ref);
  return { url, path: fullPath };
}