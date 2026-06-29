import style from './PhotoContent.module.css';
import { MediaPreview } from '../../../../shared/ui';
import { linkify } from '../../../../shared/lib';

/**
 * Контент карточки фотографии.
 */

export const PhotoContent = ({ photo }) => {
  return (
    <section className={style.content}>
      <MediaPreview type="image" src={photo.mediaUrl} alt="Фото" />

      {photo.text && <div className={style.text}>{linkify(photo.text)}</div>}
    </section>
  );
};
