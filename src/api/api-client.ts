import ky from 'ky';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mock.sb21.ru';

export const apiClient = ky.create({
  prefixUrl: API_URL,
  hooks: {
    beforeError: [
      async error => {
        const { response } = error;
        if (response && response.body) {
          try {
            const body = await response.json();
            error.message = typeof body === 'object' && body !== null && 'message' in body
              ? String(body.message)
              : error.message;
          } catch (e) {
            console.error('Error parsing response body:', e);
          }
        }
        return error;
      },
    ],
  },
});
