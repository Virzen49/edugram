import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'http://10.103.211.237:3000/api/teacher';
export async function getGrade(){
    try{
        const response = await fetch(`${BASE_URL}/getGrade`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });

        const data = await response.json().catch(() => ({}));
        console.debug('getGrade response data:', data);
        return { ok: response.ok, status: response.status, data };
    }catch(err){
        return { ok: false, status: 0, error: err };
    }
}


export async function createUpload(
  mod_id: string | number,
  cat_id: string | number,
  title: string,
  description: string,
  file: { uri: string; type: string; name: string }
) {
  const token = await AsyncStorage.getItem("token");
  const formData = new FormData();

  formData.append("mod_id", String(mod_id));
  formData.append("cat_id", String(cat_id));
  formData.append("title", title);
  formData.append("description", description);
  formData.append("file", file as any);

  const response = await fetch("http://10.103.211.237:3000/api/teacher/upload", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // ❌ Do NOT set Content-Type → fetch will auto-set it for FormData
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}