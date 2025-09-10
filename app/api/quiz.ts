const BASE_URL = 'http://10.103.211.237:3000/api/quiz';

export async function getQuiz(cat_id: number, mod_id: number) {
  const payload = { cat_id, mod_id };

  try {
    const response = await fetch(`${BASE_URL}/getQuiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    console.debug('getQuiz raw response:', data);

    // 🔑 normalize quiz into UI-friendly shape
    const normalizedQuiz = Array.isArray(data?.quiz)
      ? {
          title: data.message || 'Quiz',
          questions: data.quiz.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.options[q.answer_index], // pick correct option
            difficulty: (q.difficulty || 'EASY').toUpperCase(),
            explanation: q.explanation,
            timeLimit: q.time_limit_seconds || 30,
            type: q.type || 'multiple_choice',
            emoji: '❓', // optional, you can randomize emoji
          })),
        }
      : null;

    return { ok: response.ok, status: response.status, data: normalizedQuiz };
  } catch (error) {
    console.error('getQuiz error:', error);
    return { ok: false, status: 0, error };
  }
}

export async function generateQuiz(cat_id:number , mod_id:number) {
  const payload = { cat_id, mod_id };
  try {
    const response = await fetch(`${BASE_URL}/createQuiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    console.debug('generateQuiz response data:', data);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('generateQuiz error:', error);
    return { ok: false, status: 0, error };
  }
}