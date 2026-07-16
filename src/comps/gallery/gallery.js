'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ICON_STROKE, X } from '@/comps/icons/icons';
import css from './style.module.css';

const getLoopedPhotoIndex = (index, photoCount) => {
 if (photoCount === 0) return 0;
 if (index < 0) return photoCount - 1;
 if (index >= photoCount) return 0;
 return index;
};

export let Gallery = ({ photos = [] }) => {
 const amenityWindowRef = useRef(null);
 const amenityTrackRef = useRef(null);
 const slideRefs = useRef([]);

 const [amenityIndex, setAmenityIndex] = useState(0);
 const [move, setMove] = useState(0);
 const [modalIndex, setModalIndex] = useState(null);

 const showAmenityPhoto = (index) => {
  let newIndex = index;

  if (newIndex < 0) newIndex = photos.length - 1;
  if (newIndex >= photos.length) newIndex = 0;

  setAmenityIndex(newIndex);
 };

 const openPhotoModal = (index) => {
  setModalIndex(index);
 };

 const closePhotoModal = () => {
  setModalIndex(null);
 };

 const showModalPhoto = (index) => {
  setModalIndex(getLoopedPhotoIndex(index, photos.length));
 };

 useEffect(() => {
  const updateMove = () => {
   const amenityWindow = amenityWindowRef.current;
   const amenityTrack = amenityTrackRef.current;
   const firstSlide = slideRefs.current[0];

   if (!amenityWindow || !amenityTrack || !firstSlide) return;

   const slideWidth = firstSlide.offsetWidth;
   const gap = parseInt(getComputedStyle(amenityTrack).gap) || 0;
   const wantedMove = (slideWidth + gap) * amenityIndex;
   const maxMove = Math.max(0, amenityTrack.scrollWidth - amenityWindow.offsetWidth);
   const finalMove = Math.min(wantedMove, maxMove);

   setMove(finalMove);
  };

  updateMove();

  window.addEventListener('resize', updateMove);

  return () => {
   window.removeEventListener('resize', updateMove);
  };
 }, [amenityIndex]);

 useEffect(() => {
  if (modalIndex === null) return;

  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const handleKeyDown = (event) => {
   if (event.key === 'Escape') {
    setModalIndex(null);
   }

   if (event.key === 'ArrowLeft') {
    setModalIndex((currentIndex) => getLoopedPhotoIndex(currentIndex - 1, photos.length));
   }

   if (event.key === 'ArrowRight') {
    setModalIndex((currentIndex) => getLoopedPhotoIndex(currentIndex + 1, photos.length));
   }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
   document.body.style.overflow = originalOverflow;
   window.removeEventListener('keydown', handleKeyDown);
  };
 }, [modalIndex, photos.length]);

 if (photos.length === 0) return null;

 return (
  <div className={css.gallery_carousel}>
   <div className={css.gallery_heading}>
    <p className={css.gallery_label}>Amenity Center Photo Gallery</p>
    <h2>A closer look at the space</h2>
   </div>

   <div className={css.carousel_window} ref={amenityWindowRef}>
    <div
     className={css.carousel_track}
     ref={amenityTrackRef}
     style={{ transform: `translateX(${-move}px)` }}
    >
     {photos.map((photo, index) => (
      <button
       className={css.carousel_slide}
       key={photo}
       type="button"
       aria-label={`Open larger view of amenity center photo ${index + 1}`}
       onClick={() => openPhotoModal(index)}
       ref={(el) => {
        slideRefs.current[index] = el;
       }}
      >
       <Image
        fill
        src={`/img/amenity/${photo}`}
        alt={`Amenity center photo ${index + 1}`}
        sizes="(max-width: 700px) 80vw, (max-width: 1100px) 42vw, 390px"
       />
       <span className={css.photo_hint}>Click to enlarge</span>
      </button>
     ))}
    </div>
   </div>

   <div className={css.carousel_controls}>
    <button
     className={css.carousel_arrow}
     type="button"
     aria-label="Previous photo"
     onClick={() => showAmenityPhoto(amenityIndex - 1)}
    >
     <ChevronLeft aria-hidden="true" size={26} strokeWidth={ICON_STROKE} />
    </button>

    <div className={css.carousel_center}>
     <div className={css.carousel_counter} aria-live="polite">
      Photo {amenityIndex + 1} of {photos.length}
     </div>
     <div className={css.carousel_dots}>
      {photos.map((photo, index) => (
       <button
        key={photo}
        type="button"
        className={
         index === amenityIndex
          ? `${css.carousel_dot} ${css.carousel_dot_active}`
          : css.carousel_dot
        }
        aria-label={`Photo ${index + 1}`}
        aria-current={index === amenityIndex ? 'true' : undefined}
        onClick={() => showAmenityPhoto(index)}
       ></button>
      ))}
     </div>
    </div>

    <button
     className={css.carousel_arrow}
     type="button"
     aria-label="Next photo"
     onClick={() => showAmenityPhoto(amenityIndex + 1)}
    >
     <ChevronRight aria-hidden="true" size={26} strokeWidth={ICON_STROKE} />
    </button>
   </div>

   {modalIndex !== null && (
    <div
     className={css.photo_modal}
     role="dialog"
     aria-modal="true"
     aria-label="Large amenity center photo viewer"
     onClick={closePhotoModal}
    >
     <div className={css.modal_card} onClick={(event) => event.stopPropagation()}>
      <div className={css.modal_image_wrap}>
       <Image
        fill
        priority
        src={`/img/amenity/${photos[modalIndex]}`}
        alt={`Large amenity center photo ${modalIndex + 1}`}
        sizes="(max-width: 700px) 94vw, 88vw"
       />

       <button
        className={`${css.modal_button} ${css.modal_close}`}
        type="button"
        aria-label="Close photo viewer"
        onClick={closePhotoModal}
       >
        <X aria-hidden="true" size={24} strokeWidth={ICON_STROKE} />
       </button>

       <button
        className={`${css.modal_button} ${css.modal_arrow} ${css.modal_arrow_left}`}
        type="button"
        aria-label="Previous large photo"
        onClick={(event) => {
         event.stopPropagation();
         showModalPhoto(modalIndex - 1);
        }}
       >
        <ChevronLeft aria-hidden="true" size={34} strokeWidth={ICON_STROKE} />
       </button>

       <button
        className={`${css.modal_button} ${css.modal_arrow} ${css.modal_arrow_right}`}
        type="button"
        aria-label="Next large photo"
        onClick={(event) => {
         event.stopPropagation();
         showModalPhoto(modalIndex + 1);
        }}
       >
        <ChevronRight aria-hidden="true" size={34} strokeWidth={ICON_STROKE} />
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
};
