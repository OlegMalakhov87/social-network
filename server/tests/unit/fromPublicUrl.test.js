const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { MEDIA_ROOT } = require('../../config/mediaUploadConfig');
const { fromPublicUrl } = require('../../src/utils/fromPublicUrl');

test('fromPublicUrl принимает медиа-URL с и без начального слеша', () => {
  const expected = path.resolve(MEDIA_ROOT, 'avatars', 'avatar.jpg');

  assert.equal(fromPublicUrl('/uploads/avatars/avatar.jpg'), expected);
  assert.equal(fromPublicUrl('uploads/avatars/avatar.jpg'), expected);
});

test('fromPublicUrl отклоняет пути, которые могут выйти за пределы корневого каталога медиафайлов', () => {
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
      (error) => error.statusCode === 400 && error.code === 'INVALID_MEDIA_URL'
    );
  }
});
