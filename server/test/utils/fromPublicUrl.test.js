const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { MEDIA_ROOT } = require('../../config/mediaUploadConfig');
const { fromPublicUrl } = require('../../src/utils/fromPublicUrl');

test('accepts media URLs with and without a leading slash', () => {
  const expected = path.resolve(MEDIA_ROOT, 'avatars', 'avatar.jpg');

  assert.equal(fromPublicUrl('/uploads/avatars/avatar.jpg'), expected);
  assert.equal(fromPublicUrl('uploads/avatars/avatar.jpg'), expected);
});

test('rejects paths that can escape the media root', () => {
  for (const url of [
    '/uploads/../secret.txt',
    '/uploads/avatars/../../secret.txt',
    '/uploads/avatars//avatar.jpg',
    '/uploads/avatars/./avatar.jpg',
    '/uploads/avatars/avatar%2Ejpg',
    '/uploads/avatars/avatar\\\\.jpg',
  ]) {
    assert.throws(
      () => fromPublicUrl(url),
      (error) =>
        error.statusCode === 400 && error.code === 'INVALID_MEDIA_URL'
    );
  }
});
