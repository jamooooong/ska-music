export const validateYoutubeUrl = (url: string): boolean => {
  const youtubeRegex =
    /^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+$|^https:\/\/youtu\.be\/[\w-]+$/;
  return youtubeRegex.test(url);
};

export const generateProfessorCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const validateSongRequest = (data: {
  requester_name: string;
  song_title: string;
  message: string;
  youtube_url: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.requester_name || data.requester_name.trim().length === 0) {
    errors.requester_name = '신청자 이름을 입력해주세요';
  } else if (data.requester_name.length > 100) {
    errors.requester_name = '신청자 이름은 100자 이내로 입력해주세요';
  }

  if (!data.song_title || data.song_title.trim().length === 0) {
    errors.song_title = '노래 제목을 입력해주세요';
  } else if (data.song_title.length > 200) {
    errors.song_title = '노래 제목은 200자 이내로 입력해주세요';
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.message = '사연을 입력해주세요';
  } else if (data.message.length > 500) {
    errors.message = '사연은 500자 이내로 입력해주세요';
  }

  if (!data.youtube_url || data.youtube_url.trim().length === 0) {
    errors.youtube_url = '유튜브 링크를 입력해주세요';
  } else if (!validateYoutubeUrl(data.youtube_url)) {
    errors.youtube_url = '유효한 유튜브 URL을 입력해주세요';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};
