import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.103.211.237:3000/api/auth';

export async function login(email: string, password: string) {
  const payload = { email, password };

  try {
    const response = await fetch(`${BASE_URL}/userlogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.token) {
      await AsyncStorage.setItem('token', data.token);
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, error };
  }
}

export async function getProfile() {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return { ok: false, status: 401, error: 'No token' };

    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, error };
  }
}

export async function getToken() {
  return AsyncStorage.getItem('token');
}

export async function removeToken() {
  await AsyncStorage.removeItem('token');
}
