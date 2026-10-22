/**
 * АНСАМБЛЬ СОВРЕМЕННОГО ТАНЦА «GRAND» — КАРАГАНДА
 * ИНТЕРАКТИВНЫЙ СКРИПТ (КАРУСЕЛЬ ТРЕНЕРОВ, СВАЙПЫ, МОДАЛКИ, WHATSAPP)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ================= 1. STICKY HEADER & MOBILE MENU =================
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
      const icon = burgerBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        const icon = burgerBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // ================= 2. COUNTDOWN TIMER =================
  function initCountdown() {
    const hoursEl = document.getElementById('timerHours');
    const minsEl = document.getElementById('timerMins');
    const secsEl = document.getElementById('timerSecs');

    if (!hoursEl) return;

    let targetTime = localStorage.getItem('grand_countdown_end');
    if (!targetTime || new Date().getTime() > parseInt(targetTime, 10)) {
      targetTime = new Date().getTime() + (14 * 3600 * 1000 + 42 * 60 * 1000);
      localStorage.setItem('grand_countdown_end', targetTime);
    }

    function update() {
      const now = new Date().getTime();
      const diff = Math.max(0, parseInt(targetTime, 10) - now);

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      hoursEl.textContent = String(h).padStart(2, '0');
      minsEl.textContent = String(m).padStart(2, '0');
      secsEl.textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }
  initCountdown();

  // ================= 3. КАРУСЕЛЬ ТРЕНЕРОВ С ПОДДЕРЖКОЙ СВАЙПОВ =================
  const track = document.getElementById('trainersTrack');
  const prevBtn = document.getElementById('trainersPrev');
  const nextBtn = document.getElementById('trainersNext');
  const dotsContainer = document.getElementById('trainersDots');

  if (track) {
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    let currentIndex = 0;

    function getVisibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, slides.length - getVisibleCount());
    }

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const totalSteps = getMaxIndex() + 1;
      for (let i = 0; i < totalSteps; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Слайд ${i + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(i);
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateCarousel() {
      const maxIndex = getMaxIndex();
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      const slide = slides[0];
      if (!slide) return;
      
      const slideWidth = slide.getBoundingClientRect().width;
      const gap = 24; // matches CSS gap
      const offset = currentIndex * (slideWidth + gap);

      track.style.transform = `translateX(-${offset}px)`;

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentIndex);
        });
      }
    }

    function goToSlide(index) {
      currentIndex = index;
      updateCarousel();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const maxIndex = getMaxIndex();
        if (currentIndex < maxIndex) {
          currentIndex++;
        } else {
          currentIndex = 0; // loop
        }
        updateCarousel();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const maxIndex = getMaxIndex();
        if (currentIndex > 0) {
          currentIndex--;
        } else {
          currentIndex = maxIndex; // loop
        }
        updateCarousel();
      });
    }

    // Touch swipe support for mobile & tablet
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const diffX = startX - currentX;
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          // swipe left -> next
          if (currentIndex < getMaxIndex()) currentIndex++;
        } else {
          // swipe right -> prev
          if (currentIndex > 0) currentIndex--;
        }
        updateCarousel();
      }
    });

    createDots();
    updateCarousel();

    window.addEventListener('resize', () => {
      createDots();
      updateCarousel();
    });
  }

  // ================= 4. ФОТОГАЛЕРЕЯ — ГАРМОНИЧНАЯ КАРУСЕЛЬ И LIGHTBOX =================
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');
  const galleryDots = document.getElementById('galleryDots');
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (galleryTrack) {
    const gallerySlides = Array.from(galleryTrack.querySelectorAll('.gallery-carousel-slide'));
    let galleryIndex = 0;

    function getGalleryVisibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getGalleryMaxIndex() {
      return Math.max(0, gallerySlides.length - getGalleryVisibleCount());
    }

    function createGalleryDots() {
      if (!galleryDots) return;
      galleryDots.innerHTML = '';
      const totalSteps = getGalleryMaxIndex() + 1;
      for (let i = 0; i < totalSteps; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === galleryIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Фото ${i + 1}`);
        dot.addEventListener('click', () => {
          galleryIndex = i;
          updateGalleryCarousel();
        });
        galleryDots.appendChild(dot);
      }
    }

    function updateGalleryCarousel() {
      const maxIdx = getGalleryMaxIndex();
      if (galleryIndex > maxIdx) galleryIndex = maxIdx;
      if (galleryIndex < 0) galleryIndex = 0;

      const slide = gallerySlides[0];
      if (!slide) return;

      const slideWidth = slide.getBoundingClientRect().width;
      const gap = 20; // matches CSS gap
      const offset = galleryIndex * (slideWidth + gap);

      galleryTrack.style.transform = `translateX(-${offset}px)`;

      if (galleryDots) {
        const dots = galleryDots.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === galleryIndex);
        });
      }
    }

    if (galleryNext) {
      galleryNext.addEventListener('click', () => {
        const maxIdx = getGalleryMaxIndex();
        if (galleryIndex < maxIdx) {
          galleryIndex++;
        } else {
          galleryIndex = 0; // loop back to first
        }
        updateGalleryCarousel();
      });
    }

    if (galleryPrev) {
      galleryPrev.addEventListener('click', () => {
        const maxIdx = getGalleryMaxIndex();
        if (galleryIndex > 0) {
          galleryIndex--;
        } else {
          galleryIndex = maxIdx; // loop back to last
        }
        updateGalleryCarousel();
      });
    }

    // Touch swipe support for gallery on mobile
    let gStartX = 0;
    let gCurrentX = 0;
    let gIsDragging = false;

    galleryTrack.addEventListener('touchstart', (e) => {
      gStartX = e.touches[0].clientX;
      gIsDragging = true;
    }, { passive: true });

    galleryTrack.addEventListener('touchmove', (e) => {
      if (!gIsDragging) return;
      gCurrentX = e.touches[0].clientX;
    }, { passive: true });

    galleryTrack.addEventListener('touchend', () => {
      if (!gIsDragging) return;
      gIsDragging = false;
      const diffX = gStartX - gCurrentX;
      if (Math.abs(diffX) > 40) {
        const maxIdx = getGalleryMaxIndex();
        if (diffX > 0) {
          if (galleryIndex < maxIdx) galleryIndex++;
        } else {
          if (galleryIndex > 0) galleryIndex--;
        }
        updateGalleryCarousel();
      }
    });

    createGalleryDots();
    updateGalleryCarousel();

    window.addEventListener('resize', () => {
      createGalleryDots();
      updateGalleryCarousel();
    });

    // Lightbox on photo click
    gallerySlides.forEach(slide => {
      const card = slide.querySelector('.gallery-slide-card');
      if (card) {
        card.addEventListener('click', () => {
          const img = card.querySelector('img');
          if (img && lightbox && lightboxImg) {
            lightboxImg.src = img.src;
            if (img.alt && img.alt !== 'АСТ GranD') {
              lightboxCaption.textContent = img.alt;
              lightboxCaption.style.display = 'block';
            } else {
              lightboxCaption.textContent = '';
              lightboxCaption.style.display = 'none';
            }
            lightbox.classList.add('active');
          }
        });
      }
    });
  }

  // Close Lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox) lightbox.classList.remove('active');
      const videoModal = document.getElementById('videoModal');
      if (videoModal) closeVideoModal();
    }
  });

  // ================= 5. VIDEO MODAL =================
  const videoModal = document.getElementById('videoModal');
  const playShowreelBtn = document.getElementById('playShowreelBtn');
  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const videoIframe = document.getElementById('videoModalIframe');
  const videoModalClose = document.getElementById('videoModalClose');
  const videoDirectLink = document.getElementById('videoDirectLink');

  function openVideoModal(videoId) {
    if (videoModal && videoIframe) {
      videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      if (videoDirectLink) {
        videoDirectLink.href = `https://www.youtube.com/watch?v=${videoId}`;
      }
      videoModal.classList.add('active');
    }
  }

  function closeVideoModal() {
    if (videoModal && videoIframe) {
      videoIframe.src = '';
      videoModal.classList.remove('active');
    }
  }

  // 1. В шапке: Kazakhstan dance code FINAL (QhZs7Ilj570)
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => openVideoModal('QhZs7Ilj570'));
  }

  // 2. В блоке «Моменты сцены»: Сольный концерт "Невозможное возможно". Финал. Караганда 2025 (xBuLs3MuMrI)
  if (playShowreelBtn) {
    playShowreelBtn.addEventListener('click', () => openVideoModal('xBuLs3MuMrI'));
  }
  if (videoModalClose) {
    videoModalClose.addEventListener('click', closeVideoModal);
  }
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // ================= 6. BRANCH SWITCHER =================
  const branchTabBtns = document.querySelectorAll('.branch-tab-btn');
  const branchPanes = document.querySelectorAll('.branch-info-pane');
  const mapFrame = document.getElementById('mapFrame');

  const mapUrls = {
    tattimbeta: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2568.5!2d73.1567287!3d49.796927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x424347101894d76f%3A0x6b4cbaefad9b1!2z0YPQuy4g0KLQsNGC0YLQuNC80LHQtdGC0LAgMTAvNSwg0JrQsNGA0LDQs9Cw0L3QtNCwLCDQmtCw0LfQsNGF0YHRgtCw0L0!5e0!3m2!1sru!2skz!4v1700000000000",
    almaz: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2569.2!2d73.148!3d49.789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4243472000000001%3A0x1!2z0JzQutGALiDQodGC0LXQv9C90L7QuS00LCAzMCwg0JrQsNGA0LDQs9Cw0L3QtNCwLCDQmtCw0LfQsNGF0YHRgtCw0L0!5e0!3m2!1sru!2skz!4v1700000000000"
  };

  branchTabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      branchTabBtns.forEach(b => b.classList.remove('active'));
      branchPanes.forEach(p => p.classList.remove('active'));

      this.classList.add('active');
      const targetId = this.dataset.target;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      if (mapFrame && this.dataset.branchKey && mapUrls[this.dataset.branchKey]) {
        mapFrame.src = mapUrls[this.dataset.branchKey];
      }
    });
  });

  // ================= 7. BOOKING FORM & WHATSAPP REDIRECT =================
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const parentName = document.getElementById('parentName').value.trim();
      const childName = document.getElementById('childName').value.trim();
      const childAge = document.getElementById('childAge').value.trim();
      const branch = document.getElementById('branchSelect').value;
      const phone = document.getElementById('parentPhone').value.trim();

      if (!parentName || !phone) {
        showToast('Пожалуйста, укажите имя и телефон для связи');
        return;
      }

      const msg = `Здравствуйте! Хочу записать ребенка на БЕСПЛАТНОЕ пробное занятие в АСТ «GranD» 🎁%0A%0A` +
                  `👤 Имя родителя: ${encodeURIComponent(parentName)}%0A` +
                  `👧 Данные ребенка: ${encodeURIComponent(childName || 'Не указано')}, ${encodeURIComponent(childAge || 'не указан')} лет%0A` +
                  `🏢 Филиал: ${encodeURIComponent(branch)}%0A` +
                  `📞 Телефон: ${encodeURIComponent(phone)}%0A%0A` +
                  `Пожалуйста, подскажите расписание и ближайшее свободное время!`;

      showToast('Заявка создана! Открываем WhatsApp...');

      setTimeout(() => {
        window.open(`https://api.whatsapp.com/send?phone=77077797743&text=${msg}`, '_blank');
        bookingForm.reset();
      }, 700);
    });
  }

  // ================= 8. СИСТЕМА ОТЗЫВОВ (ДОБАВЛЕНИЕ И СОХРАНЕНИЕ) =================
  const newReviewForm = document.getElementById('newReviewForm');
  const reviewsContainer = document.getElementById('reviewsContainer');
  const starSelector = document.getElementById('starSelector');
  const ratingValueText = document.getElementById('ratingValueText');
  let selectedRating = 5;

  const ratingDescriptions = {
    1: '1 из 5 (Плохо)',
    2: '2 из 5 (Так себе)',
    3: '3 из 5 (Нормально)',
    4: '4 из 5 (Хорошо)',
    5: '5 из 5 (Отлично)'
  };

  if (starSelector) {
    const starBtns = starSelector.querySelectorAll('.star-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.dataset.val, 10);
        updateStarUI(selectedRating);
      });
      btn.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(btn.dataset.val, 10);
        updateStarUI(hoverVal, false);
      });
    });

    starSelector.addEventListener('mouseleave', () => {
      updateStarUI(selectedRating);
    });

    function updateStarUI(val, updateText = true) {
      starBtns.forEach(b => {
        const bVal = parseInt(b.dataset.val, 10);
        b.classList.toggle('active', bVal <= val);
      });
      if (updateText && ratingValueText) {
        ratingValueText.textContent = ratingDescriptions[val] || `${val} из 5`;
      }
    }
  }

  function getInitials(name) {
    if (!name) return 'ОТ';
    const clean = name.trim();
    const parts = clean.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderReviewCard(review, isPrepend = false) {
    if (!reviewsContainer) return;
    const card = document.createElement('div');
    card.className = 'review-card';
    card.style.animation = 'fadeIn 0.5s ease';

    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= review.rating) {
        starsHtml += '<i class="fa-solid fa-star"></i>';
      } else {
        starsHtml += '<i class="fa-regular fa-star" style="color: #4b5563;"></i>';
      }
    }

    const name = review.name || review.author || 'Родитель';
    const initials = getInitials(name);

    let subInfo = '';
    if (review.role && review.branch) {
      subInfo = `${escapeHtml(review.role)}, ${escapeHtml(review.branch)}`;
    } else if (review.role) {
      subInfo = escapeHtml(review.role);
    } else if (review.branch) {
      subInfo = escapeHtml(review.branch);
    } else {
      subInfo = 'Родитель ученика';
    }

    card.innerHTML = `
      <div class="review-rating">${starsHtml}</div>
      <p class="review-text">«${escapeHtml(review.text)}»</p>
      <div class="review-author">
        <div class="author-avatar">${initials}</div>
        <div class="author-info">
          <h5>${escapeHtml(name)}</h5>
          <p>${subInfo}</p>
        </div>
      </div>
    `;

    if (isPrepend && reviewsContainer.firstChild) {
      reviewsContainer.insertBefore(card, reviewsContainer.firstChild);
    } else {
      reviewsContainer.appendChild(card);
    }
  }

  function loadCommunityReviews() {
    try {
      const stored = localStorage.getItem('grand_community_reviews');
      if (stored) {
        const reviews = JSON.parse(stored);
        if (Array.isArray(reviews)) {
          reviews.slice().reverse().forEach(rev => {
            renderReviewCard(rev, true);
          });
        }
      }
    } catch (e) {
      console.warn('Could not load reviews:', e);
    }
  }

  loadCommunityReviews();

  if (newReviewForm) {
    newReviewForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const name = document.getElementById('reviewAuthorNameInput').value.trim();
      const role = document.getElementById('reviewAuthorRoleInput').value.trim();
      const branch = document.getElementById('reviewBranchInput').value;
      const text = document.getElementById('reviewTextInput').value.trim();

      if (!name || !role || !text) {
        showToast('Пожалуйста, заполните имя, статус и текст отзыва');
        return;
      }

      const today = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const dateStr = today.toLocaleDateString('ru-RU', options);

      const newReview = {
        name,
        role,
        branch,
        rating: selectedRating,
        text,
        date: dateStr,
        timestamp: Date.now()
      };

      let list = [];
      try {
        const stored = localStorage.getItem('grand_community_reviews');
        if (stored) list = JSON.parse(stored);
        if (!Array.isArray(list)) list = [];
      } catch (err) {
        list = [];
      }
      list.push(newReview);
      localStorage.setItem('grand_community_reviews', JSON.stringify(list));

      renderReviewCard(newReview, true);

      newReviewForm.reset();
      selectedRating = 5;
      if (starSelector) {
        const starBtns = starSelector.querySelectorAll('.star-btn');
        starBtns.forEach(b => b.classList.add('active'));
        if (ratingValueText) ratingValueText.textContent = ratingDescriptions[5];
      }

      showToast('Спасибо за отзыв! Он успешно добавлен.');

      if (reviewsContainer && reviewsContainer.firstElementChild) {
        reviewsContainer.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ================= 9. TOAST NOTIFICATION =================
  function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> <span>${message}</span>`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
  window.showToast = showToast;

});
