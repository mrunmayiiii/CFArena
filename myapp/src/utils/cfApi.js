import axios from 'axios';

/**
 * Fetches the Codeforces profile avatar (titlePhoto) for a given handle
 * @param {string} handle - The Codeforces handle (e.g. "tourist")
 * @returns {Promise<string|null>} The URL of the avatar, or null if it fails
 */
export const fetchCFAvatar = async (handle) => {
  if (!handle || handle === 'waiting…' || handle === '—') return null;
  
  try {
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    if (res.data && res.data.status === 'OK' && res.data.result.length > 0) {
      // Returns either the titlePhoto or the avatar. titlePhoto usually is higher res.
      return res.data.result[0].titlePhoto || res.data.result[0].avatar;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch avatar for ${handle}:`, error);
    return null;
  }
};
