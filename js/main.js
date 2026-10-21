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

  // ================= 4. GALLERY & LIGHTBOX =================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.dataset.filter;
      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const img = this.querySelector('img');
      const titleEl = this.querySelector('h5');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        if (titleEl && titleEl.textContent.trim()) {
          lightboxCaption.textContent = titleEl.textContent;
          lightboxCaption.style.display = 'block';
        } else {
          lightboxCaption.textContent = '';
          lightboxCaption.style.display = 'none';
        }
        lightbox.classList.add('active');
      }
    });
  });

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

  function openVideoModal(url) {
    if (videoModal && videoIframe) {
      videoIframe.src = url || 'https://www.youtube.com/embed/xBuLs3MuMrI?autoplay=1';
      videoModal.classList.add('active');
    }
  }

  function closeVideoModal() {
    if (videoModal && videoIframe) {
      videoIframe.src = '';
      videoModal.classList.remove('active');
    }
  }

  if (playShowreelBtn) {
    playShowreelBtn.addEventListener('click', () => openVideoModal('https://www.youtube.com/embed/xBuLs3MuMrI?autoplay=1'));
  }
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => openVideoModal('https://www.youtube.com/embed/QhZs7Ilj570?autoplay=1'));
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

  // ================= 8. TOAST NOTIFICATION =================
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
