export const isSharedPost = (text) => {
  try {
    const obj = JSON.parse(text);
    return obj && obj.type === 'sharedPost';
  } catch {
    return false;
  }
};
