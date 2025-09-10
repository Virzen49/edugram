const BASE_URL = 'http://10.103.211.237:3000/api/teacher';

type ApiResult<T = any> = Promise<{ ok: boolean; status: number; data?: T; error?: any }>;

export async function getCategory(grade: string): ApiResult {
  const payload = { grade };

  try {
    const response = await fetch(`${BASE_URL}/getcategory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    console.debug('getCategory response data:', data);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, error };
  }
}

export async function getModules(cat_id: number): ApiResult {
  const payload = { cat_id };

  try {
    const response = await fetch(`${BASE_URL}/getmodule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    console.debug('getModules response data:', data);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, error };
  }
}

function normalizeUpload(u: any) {
  const mime = (u.file_type || u.mime_type || '').toLowerCase();
  const url = u.file_url ?? u.fileUrl ?? '';
  const isVideo =
    mime.startsWith('video') || url.endsWith('.mp4') || url.includes('.mp4');

  const type = isVideo ? 'video' : 'notes';

  return {
    lectId: u.lect_id ?? u.lecture_id ?? u.id,
    userId: u.user_id ?? u.userId,
    catId: u.cat_id ?? u.catId,
    modId: u.mod_id ?? u.modId,
    title: u.title,
    description: u.description,
    mimeType: u.file_type ?? u.mime_type,
    fileType: type, // 'video' | 'notes'
    fileUrl: url,
    createdAt: u.created_at ?? u.createdAt,
    raw: u,
  };
}

export async function getLectures(cat_id: number, mod_id: number): ApiResult {
  const payload = { cat_id, mod_id };

  try {
    const response = await fetch(`${BASE_URL}/getupload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    // If API returns uploads array, normalize file types to either 'video' or 'notes'
    if (data && Array.isArray(data.uploads)) {
      const uploads = data.uploads.map(normalizeUpload);
      return { ok: response.ok, status: response.status, data: { ...data, uploads } };
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, error };
  }
}