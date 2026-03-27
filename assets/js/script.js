// Sticky header background transition
const header = document.getElementById('site-header');
const handleHeaderScroll = () => {
  if (!header) return;
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};
window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

// Touch micro-interactions (haptic-like visual feedback)
const tapSelector = 'button, .btn-primary, .contact-action, .guide-link, .main-nav a, .lang-btn, .product-nav';
document.querySelectorAll(tapSelector).forEach((el) => el.classList.add('tap-feedback'));

let activeTapElement = null;
document.addEventListener(
  'pointerdown',
  (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const interactiveTarget = target.closest(tapSelector);
    if (!interactiveTarget) return;
    interactiveTarget.classList.add('is-tapping');
    activeTapElement = interactiveTarget;
  },
  { passive: true }
);

const clearTapState = () => {
  if (!activeTapElement) return;
  activeTapElement.classList.remove('is-tapping');
  activeTapElement = null;
};

['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
  document.addEventListener(eventName, clearTapState, { passive: true });
});

// Mobile navigation toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');
const navBackdrop = document.getElementById('navBackdrop');
const navCloseBtn = document.getElementById('nav-close');
const mobileBreakpoint = 860;
const isDesktopViewport = () => window.innerWidth > mobileBreakpoint;

const getLocalizedUiText = (key, fallback) => {
  if (typeof dictionary === 'undefined') return fallback;
  return dictionary[currentLang]?.[key] || dictionary.en?.[key] || fallback;
};

const updateNavigationLabels = () => {
  if (hamburger) {
    const isOpen = mainNav?.classList.contains('open');
    hamburger.setAttribute('aria-label', isOpen ? getLocalizedUiText('navCloseMenuLabel', 'Close menu') : getLocalizedUiText('navOpenMenuLabel', 'Open menu'));
  }

  if (navCloseBtn) {
    navCloseBtn.setAttribute('aria-label', getLocalizedUiText('navCloseMenuLabel', 'Close menu'));
  }
};

const closeMobileNav = () => {
  if (!mainNav || !hamburger) return;
  mainNav.classList.remove('open');
  mainNav.querySelectorAll('.has-dropdown.open, .has-sub-dropdown.open').forEach((item) => {
    item.classList.remove('open');
  });
  document.body.classList.remove('nav-open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', getLocalizedUiText('navOpenMenuLabel', 'Open menu'));
  if (navBackdrop) navBackdrop.setAttribute('aria-hidden', 'true');
};

const openMobileNav = () => {
  if (!mainNav || !hamburger) return;
  mainNav.classList.add('open');
  document.body.classList.add('nav-open');
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', getLocalizedUiText('navCloseMenuLabel', 'Close menu'));
  if (navBackdrop) navBackdrop.setAttribute('aria-hidden', 'false');
};

if (hamburger && mainNav && navBackdrop) {
  hamburger.addEventListener('click', () => {
    if (isDesktopViewport()) return;
    if (mainNav.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  navBackdrop.addEventListener('click', closeMobileNav);

  document.addEventListener('pointerdown', (event) => {
    if (!mainNav.classList.contains('open')) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('#main-nav') || target.closest('#hamburger')) return;
    closeMobileNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mainNav.classList.contains('open')) {
      closeMobileNav();
    }
  });

  let resizeRafId;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeRafId);
    resizeRafId = window.requestAnimationFrame(() => {
      if (isDesktopViewport() && mainNav.classList.contains('open')) {
        closeMobileNav();
      }
    });
  });
}

if (navCloseBtn) {
  navCloseBtn.addEventListener('click', () => {
    closeMobileNav();
  });
}

// Mobile dropdown support
const dropdownParents = document.querySelectorAll('.has-dropdown, .has-sub-dropdown');
dropdownParents.forEach((parent) => {
  const trigger = parent.querySelector(':scope > a');
  if (!trigger) return;
  trigger.addEventListener('click', (event) => {
    if (window.innerWidth <= 860) {
      const childMenu = parent.querySelector(':scope > ul');
      if (childMenu) {
        event.preventDefault();
        parent.classList.toggle('open');
      }
    }
  });
});

// Smooth scrolling for all anchor links
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;

    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const section = document.querySelector(targetId);
    if (!section) return;

    event.preventDefault();

    const offset = header.offsetHeight;
    const top = section.getBoundingClientRect().top + window.scrollY - offset + 1;

    window.scrollTo({ top, behavior: 'smooth' });

    closeMobileNav();
  });
});

const productCategoryLinks = [...document.querySelectorAll('.main-nav .dropdown a[href^="#product-"]')];
const productCategoryCards = [...document.querySelectorAll('.product-card[id^="product-"]')];

const focusProductCard = (hash) => {
  if (!hash || !hash.startsWith('#product-')) return;
  const targetCard = document.querySelector(hash);
  if (!(targetCard instanceof HTMLElement)) return;

  productCategoryCards.forEach((card) => card.classList.remove('menu-focused'));
  targetCard.classList.add('menu-focused');

  window.setTimeout(() => {
    targetCard.classList.remove('menu-focused');
  }, 1400);
};

productCategoryLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const targetHash = link.getAttribute('href');
    window.setTimeout(() => {
      focusProductCard(targetHash);
    }, 420);
  });
});

window.addEventListener('hashchange', () => {
  focusProductCard(window.location.hash);
});

focusProductCard(window.location.hash);

// Active navigation link based on current section
const sectionAnchors = [...document.querySelectorAll('main section[id]')];
const menuSectionLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

const updateActiveNavLink = () => {
  if (sectionAnchors.length === 0 || menuSectionLinks.length === 0) return;

  const offset = header ? header.offsetHeight + 24 : 100;
  let currentSectionId = '';

  sectionAnchors.forEach((section) => {
    const sectionTop = section.offsetTop - offset;
    if (window.scrollY >= sectionTop) {
      currentSectionId = section.id;
    }
  });

  menuSectionLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isCurrent = href === `#${currentSectionId}`;
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

updateActiveNavLink();

let navHighlightTicking = false;
window.addEventListener(
  'scroll',
  () => {
    if (navHighlightTicking) return;
    navHighlightTicking = true;
    window.requestAnimationFrame(() => {
      updateActiveNavLink();
      navHighlightTicking = false;
    });
  },
  { passive: true }
);

// Scroll reveal animation
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('active'));
}

// Product galleries: internal slider + arrows + dynamic product badge
const productSliders = [];
const prefersReducedMotionUI = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const npkFormulas = [
  'NPK 20-20-20 + TE',
  'NPK 10-52-10 + TE',
  'NPK 10-10-40 + TE',
  'NPK 3-37-37 + TE'
];

const npkLines = [
  {
    brandEn: 'Agrofix Brilliant',
    brandAr: 'اجروفيكس بريلانت',
    detailsEn: [
      'Strengthens resistance to drought and diseases for stronger plants.',
      'High flowering density that prepares for abundant yield and improved fruit quality.',
      'Maintains soil fertility and provides continuous nutrition support.',
      'Supports critical stages like flowering and fruiting for abundant harvests.'
    ],
    detailsAr: [
      'يقوي المقاومة ضد الجفاف والأمراض لنباتات أكثر صلابة.',
      'كثافة عالية في الإزهار تمهد لغلة وفيرة ونوعية محسنة للثمار.',
      'يحافظ على خصوبة التربة ويوفر تغذية متواصلة.',
      'دعم المراحل الحاسمة مثل الإزهار والإثمار لمحاصيل وفيرة.'
    ]
  },
  {
    brandEn: 'Agrofix Super',
    brandAr: 'اجروفيكس سوبر',
    detailsEn: [
      'Stimulates integrated plant growth from roots to leaves.',
      'Activates root development and early growth stages.',
      'Boosts root growth and cellular structure for stronger plants.',
      'Strengthens roots and increases plant sturdiness.'
    ],
    detailsAr: [
      'تحفيز النمو المتكامل للنبات من جذوره إلى أوراقه.',
      'ينشط نمو الجذور والمراحل المبكرة لنمو النبات.',
      'تحفيز نمو الجذور والبنية الخلوية، معززًا لصحة وقوة النبات.',
      'يقوي الجذور ويزيد من صلابة النبات.'
    ]
  },
  {
    brandEn: 'Agrofix Top',
    brandAr: 'اجروفيكس توب',
    detailsEn: [
      'Balanced nutrition that supports overall growth across all stages.',
      'Strong support for root development and early establishment.',
      'Enhances flowering and leaf resistance to harsh weather.',
      'Intensive stimulation for fruit set, ripening, and quality.'
    ],
    detailsAr: [
      'توازن مثالي للتغذية يقوي النمو العام للنبات في مراحل حياته المختلفة.',
      'دعم قوي لتطور الجذور وانطلاقة النباتات في مرحلة النمو المبكر.',
      'يعزز الإزهار ومقاومة الأوراق للظروف الجوية القاسية.',
      'تحفيز مكثف لتكوين ونضج الثمار مع تعزيز جودتها.'
    ]
  },
  {
    brandEn: 'Merical',
    brandAr: 'ميريكال',
    detailsEn: [
      'Supports roots, leaves, and fruits with integrated growth.',
      'Maintains soil health with broad nutritional support.',
      'Improved resistance against drought and salinity stress.',
      'Notable improvement in fruit size and quality.'
    ],
    detailsAr: [
      'ينمي الجذور والأوراق والثمار بشكل متكامل و دعم النمو العام للنبات.',
      'يحافظ على صحة التربة بتوفير عناصر غذائية شاملة.',
      'مقاومة محسنة ضد الإجهادات مثل الجفاف وزيادة الملوحة.',
      'تحسين جودة وحجم الثمار بشكل ملحوظ.'
    ]
  },
  {
    brandEn: 'Al-Suyool',
    brandAr: 'السيول',
    detailsEn: [
      'Enhances balanced plant growth with better strength and durability.',
      'Fast root stimulation and quicker early establishment.',
      'Supports strong root growth and soil fertility.',
      'Contributes to denser flowering and higher fruiting rates.'
    ],
    detailsAr: [
      'يعزز النمو المتوازن للنباتات مع تحسين قوتها ومتانتها.',
      'تحفيز سريع لنمو الجذور والإسراع في مرحلة البداية النباتية.',
      'يدعم النمو القوي للجذور وخصوبة التربة.',
      'يساهم في زيادة كثافة الزهور ورفع معدلات الإثمار.'
    ]
  },
  {
    brandEn: 'Matrix',
    brandAr: 'ماتريكس',
    detailsEn: [
      'Integrated stimulation for leaves, roots, and fruits.',
      'Promotes heavy flowering and increased fruit production.',
      'Ideal for root-stage development and harvest preparation.',
      'Strengthens immunity and improves tolerance to poor conditions.'
    ],
    detailsAr: [
      'تحفيز النمو المتكامل للأوراق والجذور والثمار.',
      'يحفز الإزهار الغزير ويزيد من إنتاج الثمار.',
      'مثالي لمرحلة النمو الجذري والإعداد لموسم الحصاد.',
      'يقوي مناعة النبات ويحسّن مقاومته للظروف البيئية السيئة.'
    ]
  },
  {
    brandEn: 'Luminous',
    brandAr: 'لومينوس',
    detailsEn: [
      'Improves soil fertility for sustainable cultivation.',
      'Enhances early growth and root development for stronger plants.',
      'Rich in essential elements for long-term soil fertility.',
      'Improves nutrient absorption efficiency.'
    ],
    detailsAr: [
      'يعمل على تحسين خصوبة التربة لزراعة مستدامة.',
      'يعزز النمو المبكر وتطور الجذور لنباتات أقوى.',
      'غني بالعناصر الأساسية لدعم خصوبة التربة طويلة الأمد.',
      'تحسين امتصاص المغذيات.'
    ]
  },
  {
    brandEn: 'Glorious',
    brandAr: 'جلوريوس',
    detailsEn: [
      'Supports fruit formation and improves commercial quality.',
      'Accelerates root development and early plant stages.',
      'Supports stronger root development for faster healthy growth.',
      'Contributes to immunity building and disease resistance.'
    ],
    detailsAr: [
      'دعم تكوين الثمار وتحسين صفاتها الغذائية والتجارية.',
      'تسريع تطور الجذور والمرحلة البدائية للنبات.',
      'يدعم تطور وصلابة الجذور لنمو أسرع وصحة أفضل للنبات.',
      'يساهم في بناء مناعة النبات ومقاومته للأمراض.'
    ]
  },
  {
    brandEn: 'Baclorius',
    brandAr: 'بكلريوس',
    detailsEn: [
      'Increases fruiting rate and quality through comprehensive nutrition.',
      'Improves soil fertility and supports sustainable nutrient balance.',
      'Environmental stress enhancer, reducing drought and salt stress impact.',
      'Accelerates nutrient assimilation for a more fertile soil profile.'
    ],
    detailsAr: [
      'زيادة معدل الإثمار وتحسين جودة الثمار بفضل التغذية الشاملة.',
      'يحسن خصوبة التربة ويدعم التوازن الغذائي المستدام.',
      'معزز للتحمل البيئي مع تقليل التوتر الناجم عن الجفاف والأملاح.',
      'يسرع من استيعاب العناصر الغذائية لتربة أكثر خصوبة.'
    ]
  }
];

const npkProducts = npkLines.flatMap((line) => npkFormulas.map((formula, index) => ({
  brandEn: line.brandEn,
  brandAr: line.brandAr,
  formula,
  detailEn: line.detailsEn[index],
  detailAr: line.detailsAr[index]
}))).filter((item, index, arr) => {
  const key = `${item.brandEn}__${item.formula}`;
  return arr.findIndex((entry) => `${entry.brandEn}__${entry.formula}` === key) === index;
});

const npkBrands = Object.values(
  npkProducts.reduce((acc, item) => {
    if (!acc[item.brandEn]) {
      acc[item.brandEn] = {
        brandEn: item.brandEn,
        brandAr: item.brandAr,
        items: []
      };
    }

    acc[item.brandEn].items.push(item);
    return acc;
  }, {})
);

const liquidCatalog = [
  {
    nameEn: 'Agrofarm',
    nameAr: 'أجروفارم',
    formula: 'NK 4.2-2.3 + AM 25% + OM 18.7% + C 25.23%',
    highlightsEn: [
      'Strengthens roots, stems, and leaves for denser crops.',
      'Supports protein formation and improves crop nutritional value.',
      'Enhances soil fertility and vitality for stronger plants.',
      'Raises organic matter for better soil moisture retention.'
    ],
    highlightsAr: [
      'تقوية الجذور وزيادة قوة السيقان والأوراق لمحاصيل أكثر كثافة.',
      'دعم تكوين البروتين: يساهم في ارتفاع محتوى البروتين في النباتات.',
      'يعمل على تعزيز خصوبة التربة وحيويتها، مما ينتج عنه نباتات أقوى.',
      'يرفع مستويات المادة العضوية في التربة للحفاظ على الرطوبة وصحة التربة.'
    ]
  },
  {
    nameEn: 'Syntagro',
    nameAr: 'سينتاجرو',
    formula: 'NK 2.8-2.3 + OM 22.1% + Hu 18% + FU 7%',
    highlightsEn: [
      'Stimulates strong roots and greener leaves.',
      'Improves yield quantity and overall crop quality.',
      'Enhances beneficial microbes and soil structure.'
    ],
    highlightsAr: [
      'يحفز نمو جذور قوية وأوراق أكثر اخضرارًا.',
      'يحسن قدرة النبات على إنتاج محصول وفير وعالي الجودة.',
      'يدعم الكائنات الدقيقة المفيدة ويعزز البنية الترابية.'
    ]
  },
  {
    nameEn: 'Stallon Grow',
    nameAr: 'ستالون جرو',
    formula: 'NPK 5.6-4.66-3.6 + AM 10% + OM 20.8% + TE',
    highlightsEn: [
      'Balanced nutrition for all growth stages.',
      'Improves flower and fruit size and quality.',
      'Strengthens natural immunity against diseases.'
    ],
    highlightsAr: [
      'نمو متوازن يدعم جميع مراحل نمو النبات.',
      'تحسين حجم وجودة الأزهار والثمار.',
      'تعزيز المناعة الطبيعية وتقليل الإصابة بالأمراض.'
    ]
  },
  {
    nameEn: 'Celestar',
    nameAr: 'سلستار',
    formula: 'P 30 + OM 30% + AM 20% + Hu+Fu 10%',
    highlightsEn: [
      'High-phosphorus support for roots and stress resistance.',
      'Rich organic matter improves soil structure and fertility.',
      'Humic and fulvic acids improve nutrient absorption.'
    ],
    highlightsAr: [
      'تقوية الجذور وزيادة مقاومة التلف بتغذية عالية الفسفور.',
      'غني بالمادة العضوية لتحسين بنية التربة وزيادة الخصوبة.',
      'أحماض دبالية وفولفيك لرفع الامتصاص الغذائي.'
    ]
  },
  {
    nameEn: 'Marloud',
    nameAr: 'مارلود',
    formula: 'P 13 + OM 30% + AM 15% + Hu+Fu 15%',
    highlightsEn: [
      'Enhances root development with phosphate-rich composition.',
      'Improves soil fertility through high organic matter.',
      'Supports micronutrient uptake and plant vigor.'
    ],
    highlightsAr: [
      'يعزز نمو وتطور الجذور بفضل محتواه الغني بالفوسفات.',
      'يحسن خصوبة التربة عبر الزيادة في المادة العضوية.',
      'يدعم الامتصاص الغذائي ويقوي النبات.'
    ]
  },
  {
    nameEn: 'Nativo Grow',
    nameAr: 'ناتيو جرو',
    formula: 'NK 4.2-2.3+AM 25% + OM 18.7% + C 25.23%',
    highlightsEn: [
      'Strengthens stems and roots for denser and stronger plants.',
      'Contributes to increasing the nutritional value of the crop.',
      'Enhances soil vitality for sustainable healthy growth.',
      'Maintains soil moisture and health thanks to rich organic content.'
    ],
    highlightsAr: [
      'يعزز السيقان والجذور لنباتات أكثر كثافة وقوة.',
      'يساهم في زيادة القيمة الغذائية للمحصول.',
      'يرفع من حيوية التربة لاستدامة نمو صحي.',
      'يحافظ على رطوبة التربة وصحتها بفضل الثراء العضوي.'
    ]
  },
  {
    nameEn: 'Izagro',
    nameAr: 'إيزاجرو',
    formula: 'NK 2.8-2.3 + OM 22.1% + Hu 18% + FU 7%',
    highlightsEn: [
      'Improves root power and plant resilience.',
      'Supports premium yield and flavor quality.',
      'Improves organic balance and soil health.'
    ],
    highlightsAr: [
      'تعزيز قوة النبات ودعم النمو الجذري.',
      'تحسين الغلة وجودة ونكهة المحصول.',
      'الحفاظ على التوازن العضوي للتربة.'
    ]
  },
  {
    nameEn: 'Herowax Super',
    nameAr: 'هيرواكس سوبر',
    formula: 'NPK 5.6-4.66-3.6 + AM 10% + OM 20.8% + TE',
    highlightsEn: [
      'Integrated support for roots, stems, and leaves.',
      'Speeds flowering and improves fruit quality.',
      'Improves soil structure and nutrient efficiency.'
    ],
    highlightsAr: [
      'تعزيز متكامل للجذور والسيقان والأوراق.',
      'تسريع الإزهار وتحسين جودة الثمار.',
      'رفع حيوية التربة وكفاءة الاستفادة من العناصر.'
    ]
  },
  {
    nameEn: 'Maltigro',
    nameAr: 'مالتيجرو',
    formula: 'NK 2.8-2.3 + OM 22.1% + Hu 18% + FU 7%',
    highlightsEn: [
      'Stimulates root growth and greener foliage.',
      'Supports abundant and high-quality production.',
      'Reduces dependence on chemical fertilizers.'
    ],
    highlightsAr: [
      'تعزيز النمو الجذري وزيادة خضرة الأوراق.',
      'زيادة الإنتاج وتكوين محصول عالي الجودة.',
      'تقليل الحاجة للأسمدة الكيميائية.'
    ]
  },
  {
    nameEn: 'Phosphoric Acid',
    nameAr: 'حمض الفسفوريك',
    formula: 'H3PO4 85%',
    highlightsEn: [
      'Promotes roots, flowering, and fruiting.',
      'Improves crop maturity and final quality.',
      'Supports plant immunity against diseases.'
    ],
    highlightsAr: [
      'تعزيز نمو الجذور وتكوين الأزهار والثمار.',
      'تحسين النضج وجودة المحصول النهائية.',
      'تقوية مناعة النبات ومقاومة الأمراض.'
    ]
  },
  {
    nameEn: 'Growmotive',
    nameAr: 'جروموتيف',
    formula: 'NPK 5.6-4.66-3.6 + AM 10% + OM 20.8% + TE',
    highlightsEn: [
      'Balanced nutrition raises growth efficiency.',
      'Improves fruit set and productivity quality.',
      'Supplies key trace elements for plant health.'
    ],
    highlightsAr: [
      'رفع كفاءة النمو بتغذية متوازنة.',
      'تحسين الإثمار وجودة المحصول.',
      'غني بالعناصر الدقيقة لصحة نباتية أفضل.'
    ]
  },
  {
    nameEn: 'Soil Mill',
    nameAr: 'سويل ميل',
    formula: 'NK 4.2-2.3 + AM 25% + OM 18.7% + C 25.23%',
    highlightsEn: [
      'Integrated growth for roots and foliage.',
      'Improves crop nutritional value and taste.',
      'Enhances soil water-holding capacity.'
    ],
    highlightsAr: [
      'نمو وتطور متكامل للجذور والأوراق.',
      'تحسين القيمة الغذائية والنكهة للمحاصيل.',
      'زيادة قدرة التربة على الاحتفاظ بالماء.'
    ]
  },
  {
    nameEn: 'Delta Fert',
    nameAr: 'دلتا فيرت',
    formula: 'NK 2.1-3.5 + OM 26.9% + Hu+Fu 20%',
    highlightsEn: [
      'Strong, fast, balanced root and shoot growth.',
      'Improves stable long-term soil fertility.',
      'Boosts nutrient absorption and stress tolerance.'
    ],
    highlightsAr: [
      'نمو قوي وسريع للجذور والأوراق.',
      'تحسين خصوبة التربة بشكل مستدام.',
      'تعزيز امتصاص العناصر ودعم الصمود البيئي.'
    ]
  },
  {
    nameEn: 'Agropan',
    nameAr: 'اجروبان',
    formula: 'K 0.723 + OM 44% + AM 15% + Hu 19% + FU 10%',
    highlightsEn: [
      'Improves fruit quality and root strength.',
      'Rich in organic matter for soil vitality.',
      'Supports stronger nutrient efficiency.'
    ],
    highlightsAr: [
      'يحسن جودة الثمار وقوة الجذور.',
      'غني بالمادة العضوية لدعم حيوية التربة.',
      'يرفع كفاءة الاستفادة من المغذيات.'
    ]
  },
  {
    nameEn: 'Timur',
    nameAr: 'تيمور',
    formula: 'NP 20-5',
    highlightsEn: [
      'Raises drought and disease resistance.',
      'Supports stable vegetative growth.',
      'Improves resilience under stress conditions.'
    ],
    highlightsAr: [
      'يرفع مستوى مقاومة الجفاف والأمراض.',
      'يدعم نموًا خضريًا مستقرًا.',
      'يعزز تحمل النبات للظروف القاسية.'
    ]
  },
  {
    nameEn: 'Agrostar',
    nameAr: 'اجروستار',
    formula: 'P 0.0001 + OM 46% + AM 25% + Hu 11% + FU 10% + TE',
    highlightsEn: [
      'Activates biological soil activity.',
      'Improves soil structure and porosity.',
      'Supports sustainable plant vigor.'
    ],
    highlightsAr: [
      'يعزز النشاط البيولوجي في التربة.',
      'يطور بنية التربة ويحسن تهويتها.',
      'يدعم قوة النبات بشكل مستدام.'
    ]
  },
  {
    nameEn: 'Agrofix Fertisol',
    nameAr: 'اجروفيكس فرتيسول',
    formula: 'NK 2.1-3.5 + OM 26.9% + Hu+Fu 20%',
    highlightsEn: [
      'Contributes to optimal development of leaves and stems.',
      'Improves soil structure and increases fertility.',
      'Supports beneficial organisms for soil health.',
      'Helps reduce environmental stress and increases plant resistance.'
    ],
    highlightsAr: [
      'يساهم في تطوير الأوراق والسيقان بشكل مثالي.',
      'يعمل على تحسين بنية التربة وزيادة خصوبتها.',
      'يدعم الكائنات الحية المفيدة لصحة التربة.',
      'يساعد في الحد من التوتر البيئي ويزيد من مقاومة النباتات.'
    ]
  },
  {
    nameEn: 'Top Soil',
    nameAr: 'توب سويل',
    formula: 'NK 2.1-3.5 + OM 26.9% + Hu+Fu 20%',
    highlightsEn: [
      'Raises fertility and stimulates root and leaf growth.',
      'Increases organic matter in soil to improve structure.',
      'Enhances plant ability to absorb nutrients.',
      'Supports plant sustainability and resilience against environmental stress.'
    ],
    highlightsAr: [
      'يزيد الخصوبة ويحفز نمو الجذور والأوراق.',
      'يرفع المادة العضوية في التربة لتحسين بنيتها.',
      'يعزز من قدرة النبات على امتصاص العناصر الغذائية.',
      'يدعم استدامة النبات والصمود في مواجهة الإجهاد البيئي.'
    ]
  },
  {
    nameEn: 'Agrofix Super',
    nameAr: 'اجروفيكس سوبر',
    formula: 'NPK 0-20-30',
    highlightsEn: [
      'At the beginning of cultivation to form a strong and large root system.',
      'In the pre-flowering stage to form a dense floral set.',
      'During fruit sizing, coloring, and quality enhancement for better taste.',
      'For branch extension and thickening with a distinctive red color.'
    ],
    highlightsAr: [
      'في بداية الزراعة لتشكيل مجموع جذري قوي وكبير.',
      'فترة ما قبل التزهير لتشكيل مجموع زهري كثيف.',
      'فترة تكبير وتحجيم وتلوين الثمار وجودتها واكسابها نكهة وطعم لذيذ.',
      'لمد وتسميك الفروع واكسابها اللون الأحمر المميز.'
    ]
  },
  {
    nameEn: 'Agrofix Top',
    nameAr: 'اجروفيكس توب',
    formula: 'NPK 25-30-20-10',
    highlightsEn: [
      'High nitrogen ratio supports formation of leaves and proteins.',
      'Organic matter increases microbial activity and preserves moisture.',
      'Amino acids help plants tolerate drought, heat, and salinity.',
      'Fulvic acid increases nutrient solubility and transport inside the plant.'
    ],
    highlightsAr: [
      'بفضل نسبة النيتروجين العالية التي تدعم تكوين الأوراق والبروتينات.',
      'عبر المادة العضوية التي تزيد النشاط الميكروبي وتحافظ على الرطوبة.',
      'من خلال الأحماض الأمينية التي تساعد النبات على تحمل الجفاف والحرارة والملوحة.',
      'بفضل حمض الفولفيك الذي يزيد ذوبان المغذيات ونقلها داخل النبات.'
    ]
  },
  {
    nameEn: 'Agrofix Super',
    nameAr: 'اجروفيكس سوبر',
    formula: 'NPK 0-40-52',
    highlightsEn: [
      'Used on field crops and fruit trees across all growth stages.'
    ],
    highlightsAr: [
      'يستعمل اجروفيكس سوبر على مختلف المحاصيل الحقلية وأشجار الفاكهة وفي جميع مراحل النمو.'
    ]
  },
  {
    nameEn: 'Agrovin',
    nameAr: 'اجروفين',
    formula: 'NPK 11-8-6',
    highlightsEn: [
      'Fast-acting liquid growth activator that increases productivity for all crops.',
      'Contains all major and minor essential nutrients.'
    ],
    highlightsAr: [
      'سماد سائل منشط للنمو وسريع المفعول وزيادة الإنتاجية على جميع المحاصيل.',
      'يحتوي على جميع العناصر الغذائية الاساسية الكبرى والصغرى.'
    ]
  },
  {
    nameEn: 'Agrovelan',
    nameAr: 'أجروفيلان',
    formula: 'NPK 38-7-6',
    highlightsEn: [
      'Treats soil salinity.',
      'Increases soil fertility.',
      'Improves fruit maturity.',
      'Enhances resistance to frost and drought.'
    ],
    highlightsAr: [
      'يعالج ملوحة التربة.',
      'زيادة خصوبة التربة.',
      'زيادة نضج الثمار.',
      'مقاومة النبات للصقيع والجفاف.'
    ]
  }
];

const humicCatalog = [
  {
    nameEn: 'Humic Power',
    nameAr: 'هيومك باور',
    formula: 'Humic acids 65% + Fulvic acid 10% + Potassium oxide (K2O) 10%',
    highlightsEn: [
      'Improves soil structure and increases water-holding capacity for better plant growth.',
      'Facilitates nutrient uptake from soil, enhancing plant growth and health.',
      'Helps treat soil salinity, boosts vegetative growth, and increases productivity.',
      'Enhances root growth and density, enabling plants to absorb more water and nutrients.'
    ],
    highlightsAr: [
      'يعمل على تحسين بنية التربة وزيادة قدرتها على الاحتفاظ بالماء، مما يساعد النباتات على النمو بشكل أفضل.',
      'يسهل امتصاص النباتات للعناصر الغذائية من التربة، مما يعزز نموها وصحتها.',
      'يعالج ملوحة التربة وزيادة النمو الخضري وزيادة الانتاج.',
      'يعزز نمو الجذور ويزيد من كثافتها، مما يمكن النباتات من الحصول على المزيد من الماء والعناصر الغذائية.'
    ]
  },
  {
    nameEn: 'Humic Star',
    nameAr: 'هيومك ستار',
    formula: 'Humic acids 65% + Fulvic acid 10% + Potassium oxide (K2O) 10%',
    highlightsEn: [
      'Improves soil structure and increases water-holding capacity for better plant growth.',
      'Facilitates nutrient uptake from soil, enhancing plant growth and health.',
      'Helps treat soil salinity, boosts vegetative growth, and increases productivity.',
      'Enhances root growth and density, enabling plants to absorb more water and nutrients.'
    ],
    highlightsAr: [
      'يعمل على تحسين بنية التربة وزيادة قدرتها على الاحتفاظ بالماء، مما يساعد النباتات على النمو بشكل أفضل.',
      'يسهل امتصاص النباتات للعناصر الغذائية من التربة، مما يعزز نموها وصحتها.',
      'يعالج ملوحة التربة وزيادة النمو الخضري وزيادة الانتاج.',
      'يعزز نمو الجذور ويزيد من كثافتها، مما يمكن النباتات من الحصول على المزيد من الماء والعناصر الغذائية.'
    ]
  },
  {
    nameEn: 'Nitro Hum',
    nameAr: 'نيترو هيوم',
    formula: 'Humic acids 65% + Fulvic acid 10% + Potassium oxide (K2O) 10%',
    highlightsEn: [
      'Improves soil structure and increases water-holding capacity for better plant growth.',
      'Facilitates nutrient uptake from soil, enhancing plant growth and health.',
      'Helps treat soil salinity, boosts vegetative growth, and increases productivity.',
      'Enhances root growth and density, enabling plants to absorb more water and nutrients.'
    ],
    highlightsAr: [
      'يعمل على تحسين بنية التربة وزيادة قدرتها على الاحتفاظ بالماء، مما يساعد النباتات على النمو بشكل أفضل.',
      'يسهل امتصاص النباتات للعناصر الغذائية من التربة، مما يعزز نموها وصحتها.',
      'يعالج ملوحة التربة وزيادة النمو الخضري وزيادة الانتاج.',
      'يعزز نمو الجذور ويزيد من كثافتها، مما يمكن النباتات من الحصول على المزيد من الماء والعناصر الغذائية.'
    ]
  },
  {
    nameEn: 'Agrofix Potassium Humate',
    nameAr: 'أجروفيكس هيومات البوتاسيوم',
    formula: 'Humic acids 65% + Fulvic acid 10% + Potassium oxide (K2O) 10%',
    highlightsEn: [
      'Improves soil structure and increases water-holding capacity for better plant growth.',
      'Facilitates nutrient uptake from soil, enhancing plant growth and health.',
      'Helps treat soil salinity, boosts vegetative growth, and increases productivity.',
      'Enhances root growth and density, enabling plants to absorb more water and nutrients.'
    ],
    highlightsAr: [
      'يعمل على تحسين بنية التربة وزيادة قدرتها على الاحتفاظ بالماء، مما يساعد النباتات على النمو بشكل أفضل.',
      'يسهل امتصاص النباتات للعناصر الغذائية من التربة، مما يعزز نموها وصحتها.',
      'يعالج ملوحة التربة وزيادة النمو الخضري وزيادة الانتاج.',
      'يعزز نمو الجذور ويزيد من كثافتها، مما يمكن النباتات من الحصول على المزيد من الماء والعناصر الغذائية.'
    ]
  }
];

const renderNpkBrandDetails = (brandIndex) => {
  const holder = document.getElementById('npk-inline-details');
  if (!holder) return;

  const isArabic = (document.documentElement.lang || 'en').startsWith('ar');
  const safeIndex = ((brandIndex % npkBrands.length) + npkBrands.length) % npkBrands.length;
  const activeBrand = npkBrands[safeIndex];

  if (!activeBrand) {
    holder.innerHTML = '';
    return;
  }

  const title = isArabic ? `${activeBrand.brandAr}` : `${activeBrand.brandEn} Details`;
  const subtitle = isArabic
    ? `عدد التركيبات: ${activeBrand.items.length}`
    : `Formulas: ${activeBrand.items.length}`;

  const list = activeBrand.items.map((item) => `
    <li>
      <strong>${item.formula}</strong>
      <span>${isArabic ? item.detailAr : item.detailEn}</span>
    </li>
  `).join('');

  holder.innerHTML = `
    <article class="npk-inline-brand">
      <div class="npk-inline-head">
        <h4>${title}</h4>
        <small>${subtitle}</small>
      </div>
      <ul>${list}</ul>
    </article>
  `;

  holder.classList.remove('is-updated');
  requestAnimationFrame(() => {
    holder.classList.add('is-updated');
  });
};

const renderLiquidCatalogDetails = (productIndex) => {
  const holder = document.getElementById('liquid-inline-details');
  if (!holder) return;

  const isArabic = (document.documentElement.lang || 'en').startsWith('ar');
  const safeIndex = ((productIndex % liquidCatalog.length) + liquidCatalog.length) % liquidCatalog.length;
  const active = liquidCatalog[safeIndex];

  if (!active) {
    holder.innerHTML = '';
    return;
  }

  const title = isArabic ? `${active.nameAr}` : `${active.nameEn} Details`;
  const subtitle = isArabic ? 'التركيبة' : 'Formula';

  const points = (isArabic ? active.highlightsAr : active.highlightsEn)
    .map((line) => `
      <li>
        <span>${line}</span>
      </li>
    `)
    .join('');

  holder.innerHTML = `
    <article class="npk-inline-brand">
      <div class="npk-inline-head">
        <h4>${title}</h4>
        <small>${subtitle}</small>
      </div>
      <ul>
        <li>
          <strong>${active.formula}</strong>
        </li>
      </ul>
      <ul>${points}</ul>
    </article>
  `;

  holder.classList.remove('is-updated');
  requestAnimationFrame(() => {
    holder.classList.add('is-updated');
  });
};

const renderHumicCatalogDetails = (productIndex) => {
  const holder = document.getElementById('humic-inline-details');
  if (!holder) return;

  const isArabic = (document.documentElement.lang || 'en').startsWith('ar');
  const safeIndex = ((productIndex % humicCatalog.length) + humicCatalog.length) % humicCatalog.length;
  const active = humicCatalog[safeIndex];

  if (!active) {
    holder.innerHTML = '';
    return;
  }

  const title = isArabic ? `${active.nameAr}` : `${active.nameEn} Details`;
  const subtitle = isArabic ? 'التركيبة' : 'Formula';

  const points = (isArabic ? active.highlightsAr : active.highlightsEn)
    .map((line) => `
      <li>
        <span>${line}</span>
      </li>
    `)
    .join('');

  holder.innerHTML = `
    <article class="npk-inline-brand">
      <div class="npk-inline-head">
        <h4>${title}</h4>
        <small>${subtitle}</small>
      </div>
      <ul>
        <li>
          <strong>${active.formula}</strong>
        </li>
      </ul>
      <ul>${points}</ul>
    </article>
  `;

  holder.classList.remove('is-updated');
  requestAnimationFrame(() => {
    holder.classList.add('is-updated');
  });
};

document.querySelectorAll('[data-product-slider]').forEach((gallery) => {
  const slides = Array.from(gallery.querySelectorAll('.product-slide'));
  const dotsWrap = gallery.querySelector('.product-dots');
  const prevBtn = gallery.querySelector('.product-nav.prev');
  const nextBtn = gallery.querySelector('.product-nav.next');
  const card = gallery.closest('.product-card');
  const badgeName = card ? card.querySelector('.current-product-name') : null;
  const badgeDetail = card ? card.querySelector('.current-product-detail') : null;
  const isNpkCatalogGallery = gallery.dataset.npkCatalog === 'true';
  const isLiquidCatalogGallery = gallery.dataset.liquidCatalog === 'true';
  const isHumicCatalogGallery = gallery.dataset.humicCatalog === 'true';

  if (!slides.length || !dotsWrap || !prevBtn || !nextBtn) return;
  if (!isNpkCatalogGallery && !isLiquidCatalogGallery && !isHumicCatalogGallery && (!badgeName || !badgeDetail)) return;

  gallery.setAttribute('tabindex', '0');
  gallery.setAttribute('role', 'region');
  gallery.setAttribute('aria-roledescription', 'carousel');

  let currentStep = 0;
  let intervalId = null;

  const getProductName = (slide) => {
    const lang = document.documentElement.lang || 'en';
    return lang.startsWith('ar')
      ? (slide.dataset.productAr || slide.dataset.productEn || slide.alt || '')
      : (slide.dataset.productEn || slide.alt || '');
  };

  const getProductDetail = (slide) => {
    const lang = document.documentElement.lang || 'en';
    return lang.startsWith('ar')
      ? (slide.dataset.detailAr || slide.dataset.detailEn || '')
      : (slide.dataset.detailEn || slide.dataset.detailAr || '');
  };

  const getNameFromStep = (step) => {
    if (isNpkCatalogGallery) return '';
    if (isLiquidCatalogGallery) {
      const lang = document.documentElement.lang || 'en';
      const item = liquidCatalog[((step % liquidCatalog.length) + liquidCatalog.length) % liquidCatalog.length];
      if (!item) return '';
      return lang.startsWith('ar') ? item.nameAr : item.nameEn;
    }
    if (isHumicCatalogGallery) {
      const lang = document.documentElement.lang || 'en';
      const item = humicCatalog[((step % humicCatalog.length) + humicCatalog.length) % humicCatalog.length];
      if (!item) return '';
      return lang.startsWith('ar') ? item.nameAr : item.nameEn;
    }

    const slide = slides[((step % slides.length) + slides.length) % slides.length];
    return getProductName(slide);
  };

  const getDetailFromStep = (step) => {
    if (isNpkCatalogGallery) return '';
    if (isLiquidCatalogGallery) {
      const item = liquidCatalog[((step % liquidCatalog.length) + liquidCatalog.length) % liquidCatalog.length];
      return item ? item.formula : '';
    }
    if (isHumicCatalogGallery) {
      const item = humicCatalog[((step % humicCatalog.length) + humicCatalog.length) % humicCatalog.length];
      return item ? item.formula : '';
    }

    const slide = slides[((step % slides.length) + slides.length) % slides.length];
    return getProductDetail(slide);
  };

  const setActiveSlide = (nextStep) => {
    const maxSteps = isNpkCatalogGallery
      ? npkBrands.length
      : (isLiquidCatalogGallery ? liquidCatalog.length : (isHumicCatalogGallery ? humicCatalog.length : slides.length));
    currentStep = (nextStep + maxSteps) % maxSteps;
    const imageIndex = currentStep % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === imageIndex);
    });

    const dots = dotsWrap.querySelectorAll('.product-dot');
    dots.forEach((dot, index) => {
      const isActive = (isNpkCatalogGallery || isLiquidCatalogGallery || isHumicCatalogGallery)
        ? index === currentStep
        : index === imageIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', String(isActive));
    });

    if (badgeName && badgeDetail) {
      badgeName.textContent = getNameFromStep(currentStep);
      badgeDetail.textContent = getDetailFromStep(currentStep);
    }

    if (isNpkCatalogGallery) {
      renderNpkBrandDetails(currentStep);
    }

    if (isLiquidCatalogGallery) {
      renderLiquidCatalogDetails(currentStep);
    }

    if (isHumicCatalogGallery) {
      renderHumicCatalogDetails(currentStep);
    }
  };

  const goNext = () => setActiveSlide(currentStep + 1);
  const goPrev = () => setActiveSlide(currentStep - 1);

  const stopAutoPlay = () => {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
  };

  const startAutoPlay = () => {
    if (prefersReducedMotionUI || slides.length < 2) return;
    stopAutoPlay();
    const slideDelay = 3600 + Math.floor(Math.random() * 1400);
    intervalId = setInterval(goNext, slideDelay);
  };

  const dotsCount = isNpkCatalogGallery
    ? npkBrands.length
    : (isLiquidCatalogGallery ? liquidCatalog.length : (isHumicCatalogGallery ? humicCatalog.length : slides.length));
  Array.from({ length: dotsCount }).forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'product-dot';
    dot.setAttribute(
      'aria-label',
      isNpkCatalogGallery
        ? `Show NPK product set ${index + 1}`
        : (isLiquidCatalogGallery
          ? `Show liquid product ${index + 1}`
          : (isHumicCatalogGallery ? `Show humic product ${index + 1}` : `Show product image ${index + 1}`))
    );
    dot.addEventListener('click', () => {
      setActiveSlide(index);
      startAutoPlay();
    });
    dotsWrap.appendChild(dot);
  });

  prevBtn.addEventListener('click', () => {
    goPrev();
    startAutoPlay();
  });

  nextBtn.addEventListener('click', () => {
    goNext();
    startAutoPlay();
  });

  gallery.addEventListener('mouseenter', stopAutoPlay);
  gallery.addEventListener('mouseleave', startAutoPlay);
  gallery.addEventListener('focusin', stopAutoPlay);
  gallery.addEventListener('focusout', startAutoPlay);

  gallery.addEventListener('keydown', (event) => {
    const isRtl = (document.documentElement.dir || 'ltr') === 'rtl';

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (isRtl) {
        goPrev();
      } else {
        goNext();
      }
      startAutoPlay();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (isRtl) {
        goNext();
      } else {
        goPrev();
      }
      startAutoPlay();
    }
  });

  let touchStartX = 0;
  let touchDeltaX = 0;
  const swipeThreshold = 42;

  gallery.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.touches[0]?.clientX || 0;
      touchDeltaX = 0;
      stopAutoPlay();
    },
    { passive: true }
  );

  gallery.addEventListener(
    'touchmove',
    (event) => {
      const currentX = event.touches[0]?.clientX || 0;
      touchDeltaX = currentX - touchStartX;
    },
    { passive: true }
  );

  gallery.addEventListener(
    'touchend',
    () => {
      if (Math.abs(touchDeltaX) >= swipeThreshold) {
        if (touchDeltaX < 0) {
          goNext();
        } else {
          goPrev();
        }
      }
      startAutoPlay();
    },
    { passive: true }
  );

  setActiveSlide(0);
  startAutoPlay();

  productSliders.push({
    updateBadge: () => {
      if (badgeName && badgeDetail) {
        badgeName.textContent = getNameFromStep(currentStep);
        badgeDetail.textContent = getDetailFromStep(currentStep);
      }
      if (isNpkCatalogGallery) {
        renderNpkBrandDetails(currentStep);
      }
      if (isLiquidCatalogGallery) {
        renderLiquidCatalogDetails(currentStep);
      }
      if (isHumicCatalogGallery) {
        renderHumicCatalogDetails(currentStep);
      }
    },
    stop: stopAutoPlay,
    start: startAutoPlay
  });
});

const refreshProductSliderLanguage = () => {
  productSliders.forEach((slider) => slider.updateBadge());
};

document.addEventListener('visibilitychange', () => {
  productSliders.forEach((slider) => {
    if (document.hidden) {
      slider.stop();
    } else {
      slider.start();
    }
  });
});


// Real-time form validation
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
let currentLang = 'ar';

const t = (key) => dictionary[currentLang]?.[key] || dictionary.en?.[key] || key;

const fields = {
  name: {
    input: document.getElementById('name'),
    error: document.getElementById('nameError'),
    validate: (value) => value.trim().length >= 2,
    messageKey: 'validationName'
  },
  email: {
    input: document.getElementById('email'),
    error: document.getElementById('emailError'),
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    messageKey: 'validationEmail'
  },
  phone: {
    input: document.getElementById('phone'),
    error: document.getElementById('phoneError'),
    validate: (value) => /^[+0-9\s()-]{7,20}$/.test(value.trim()),
    messageKey: 'validationPhone'
  },
  message: {
    input: document.getElementById('message'),
    error: document.getElementById('messageError'),
    validate: (value) => value.trim().length >= 10,
    messageKey: 'validationMessage'
  }
};

const validateField = (fieldObj) => {
  if (!fieldObj?.input || !fieldObj?.error) return true;
  const value = fieldObj.input.value;
  const isValid = fieldObj.validate(value);
  fieldObj.error.textContent = isValid ? '' : t(fieldObj.messageKey);
  fieldObj.input.setAttribute('aria-invalid', String(!isValid));
  return isValid;
};

if (form && formStatus) {
  Object.values(fields).forEach((fieldObj) => {
    if (!fieldObj.input) return;
    fieldObj.input.addEventListener('input', () => validateField(fieldObj));
    fieldObj.input.addEventListener('blur', () => validateField(fieldObj));
  });

  form.addEventListener('submit', (event) => {
    let allValid = true;
    Object.values(fields).forEach((fieldObj) => {
      const valid = validateField(fieldObj);
      if (!valid) allValid = false;
    });

    if (!allValid) {
      event.preventDefault();
      formStatus.textContent = t('formFixErrors');
      formStatus.style.color = '#c62828';
    }
  });
}

// Status message after PHP redirect
const params = new URLSearchParams(window.location.search);
const status = params.get('status');
const updateFormStatusByQuery = () => {
  if (!formStatus || !form) return;
  if (status === 'sent') {
    formStatus.textContent = t('formSent');
    formStatus.style.color = '#2f7d32';
    form.reset();
  } else if (status === 'error') {
    formStatus.textContent = t('formError');
    formStatus.style.color = '#c62828';
  }
};

// Footer year
const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

// Language switcher (EN/AR)
const langButtons = document.querySelectorAll('.lang-btn');

const dictionary = {
  en: {
    navMenuTitle: 'Menu',
    navOpenMenuLabel: 'Open menu',
    navCloseMenuLabel: 'Close menu',
    navHome: 'Home',
    navAbout: 'About',
    navProducts: 'Products',
    navGuidance: 'Guidance',
    navContact: 'Contact',
    productNpk: 'NPK Fertilizers',
    productLiquid: 'Liquid Fertilizers',
    productHumic: 'Humic',
    catNpk: 'NPK Fertilizers',
    catLiquid: 'Liquid Fertilizers',
    catHumic: 'Humic',
    humicAcid: 'Humic Acid',
    fulvicAcid: 'Fulvic Acid',
    heroEyebrow: '',
    heroTitle: 'Agrofix United for Agricultural Fertilizers Industry',
    heroSubtext: 'Quality, Excellence, Innovation',
    heroCta: 'Contact Us',
    aboutTitle: 'Why Agrofix United',
    aboutText: 'We combine science, sustainability, and precision manufacturing to achieve the best results.',
    globalQuality: 'Global Quality',
    globalQualityText: 'We follow international manufacturing standards to deliver high-quality products that exceed our customers expectations in every production stage.',
    envSafety: 'Environmental Safety',
    envSafetyText: 'Eco-friendly formulations balance agricultural needs and soil protection to ensure long-term resource sustainability.',
    innovation: 'Innovation and Development',
    innovationText: 'Using advanced technologies and modern methods to transform agricultural knowledge into innovative solutions that improve productivity.',
    productsTitle: 'Our Product Categories',
    productsText: 'Tailored nutrition programs for diverse crops, climates, and growth stages.',
    activeProduct: 'Active Product',
    npkDesc: 'Balanced macro-nutrient blends for robust root, leaf, and fruit development.',
    liquidDesc: 'Fast-acting nutrition for fertigation and foliar application programs.',
    humicDesc: 'Soil conditioning solutions that improve nutrient uptake and microbial vitality.',
    npkCount: 'Products',
    liquidCount: 'Products',
    humicCount: 'Products',
    npkItem1: 'NPK 20-20-20',
    npkItem2: 'NPK 15-15-15',
    npkItem3: 'NPK 12-12-36 + TE',
    liquidItem1: 'Calcium-Boron Liquid',
    liquidItem2: 'High Potassium Liquid',
    liquidItem3: 'Micronutrient Mix (Chelated)',
    humicItem1: 'Humic Acid 85%',
    humicItem2: 'Fulvic Acid 70%',
    humicItem3: 'Potassium Humate Flakes',
    guidanceTitle: 'Agricultural Guidance',
    guidanceText: 'We provide expert advice and integrated fertilization programs to ensure plant health and crop quality.',
    guide1Title: 'Effective Fertilization Strategies',
    guide1Text: 'Nutrient integration: supplying plants with major nutrients NPK and micronutrients such as iron and magnesium for balanced growth. Smart solutions: using controlled-release fertilizers to avoid over-application and ensure a steady nutrient flow. Biological support: activating soil microbes to increase nutrient availability and root absorption.',
    guide1Point1: 'Nutrient integration: supply plants with major nutrients NPK and micronutrients such as iron and magnesium for balanced growth.',
    guide1Point2: 'Smart solutions: use controlled-release fertilizers to avoid over-application and ensure a steady nutrient flow.',
    guide1Point3: 'Biological support: activate soil microbes to increase nutrient availability and improve root absorption.',
    guide2Title: 'Liquid Fertilizer Revolution',
    guide2Text: 'Fast response: we recommend liquid fertilizers for immediate absorption and rapid crop impact. Application precision: control doses and distribute them uniformly through foliar spraying or irrigation systems.',
    guide2Point1: 'Fast response: we recommend liquid fertilizers for immediate absorption and rapid crop impact.',
    guide2Point2: 'Application precision: control doses and distribute them uniformly through foliar spraying or irrigation systems.',
    guide2Point3: 'Higher efficiency: uniform nutrient distribution ensures balanced growth across all parts of the field.',
    guide3Title: 'Care for Yemeni Crops',
    guide3Text: 'Vegetables: focus on nitrogen for vegetative growth and calcium to protect fruits from post-harvest disorders. Fruit trees: a stage-based fertilization program; phosphorus for flowering and potassium to enhance fruit flavor and quality.',
    guide3Point1: 'Vegetables: focus on nitrogen for vegetative growth, and calcium to protect fruits from post-harvest disorders.',
    guide3Point2: 'Fruit trees: use a stage-based fertilization program with phosphorus during flowering.',
    guide3Point3: 'Enhance fruit quality and flavor by supporting potassium during development and fruiting stages.',
    readMore: 'Learn More',
    contactTitle: 'Contact Agrofix United',
    contactText: 'Send your request and we will respond as soon as possible.',
    contactDirectTitle: 'Contact Us',
    contactPhoneLabel: 'Phone',
    contactEmailLabel: 'Email',
    contactAddressLabel: 'Address',
    contactAddressValue: 'Taiz - Al-Houban, Yemen',
    validationName: 'Please enter at least 2 characters.',
    validationEmail: 'Please enter a valid email address.',
    validationPhone: 'Please enter a valid phone number.',
    validationMessage: 'Message must be at least 10 characters.',
    formFixErrors: 'Please correct the highlighted fields before submitting.',
    formSent: 'Thank you. Your message was sent successfully.',
    formError: 'Unable to send your message right now. Please try again later.',
    labelName: 'Full Name',
    labelEmail: 'Email Address',
    labelPhone: 'Phone Number',
    labelMessage: 'Message',
    sendMessage: 'Send Message',
    footerText: 'Advanced agricultural fertilizers for sustainable global growth.',
    footerBrand: 'Agrofix United',
    footerTagline: 'We innovate today.. to harvest tomorrow.',
    footerRights: 'All rights reserved to Agrofix United Agricultural Fertilizers Industry Company',
    terms: 'Terms of Use',
    privacy: 'Privacy Policy',
    quickLinks: 'Quick Links',
    followUs: 'Follow Us',
    rights: 'All rights reserved.'
  },
  ar: {
    navMenuTitle: 'القائمة',
    navOpenMenuLabel: 'فتح القائمة',
    navCloseMenuLabel: 'إغلاق القائمة',
    navHome: 'الرئيسية',
    navAbout: 'من نحن',
    navProducts: 'المنتجات',
    navGuidance: 'الإرشاد الزراعي',
    navContact: 'تواصل معنا',
    productNpk: 'أسمدة NPK',
    productLiquid: 'الأسمدة السائلة',
    productHumic: 'هيومك',
    catNpk: ' أسمدة NPK',
    catLiquid: ' الأسمدة السائلة',
    catHumic: ' هيومك',
    humicAcid: 'حمض الهيوميك',
    fulvicAcid: 'حمض الفولفيك',
    heroEyebrow: '',
    heroTitle: 'أجروفيكس المتحدة لصناعة الأسمدة الزراعية',
    heroSubtext: 'جودة، تميز، ابتكار',
    heroCta: 'تواصل معنا',
    aboutTitle: 'لماذا اجروفيكس المتحدة',
    aboutText: 'نجمع بين العلم والاستدامة ودقة التصنيع لتحقيق أفضل النتائج.',
    globalQuality: 'جودة عالمية',
    globalQualityText: 'نلتزم بمعايير التصنيع العالمية لتقديم منتجات عالية الجودة تفوق توقعات عملائنا في كل مرحلة إنتاج.',
    envSafety: 'أمان بيئي',
    envSafetyText: 'تركيبات صديقة للبيئة توازن بين احتياجات الزراعة وحماية التربة لضمان استدامة الموارد على المدى الطويل.',
    innovation: 'الابتكار والتطوير',
    innovationText: 'استخدام التقنيات المتقدمة والأساليب الحديثة لتحويل المعرفة الزراعية إلى حلول مبتكرة ترفع كفاءة الإنتاج.',
    productsTitle: 'فئات منتجاتنا',
    productsText: 'برامج تغذية مخصصة لمختلف المحاصيل والظروف المناخية ومراحل النمو.',
    activeProduct: 'المنتج الحالي',
    npkDesc: 'خلطات متوازنة من العناصر الكبرى لدعم الجذور والأوراق والثمار.',
    liquidDesc: 'تغذية سريعة الامتصاص للري بالتسميد والتطبيق الورقي.',
    humicDesc: 'محاليل محسنة للتربة لزيادة امتصاص العناصر وتنشيط الكائنات الدقيقة.',
    npkCount: 'المنتجات',
    liquidCount: 'المنتجات',
    humicCount: 'المنتجات',
    npkItem1: 'NPK 20-20-20',
    npkItem2: 'NPK 15-15-15',
    npkItem3: 'NPK 12-12-36 + عناصر صغرى',
    liquidItem1: 'سائل كالسيوم-بورون',
    liquidItem2: 'سائل عالي البوتاسيوم',
    liquidItem3: 'خليط عناصر صغرى مخلبية',
    humicItem1: 'حمض الهيوميك 85%',
    humicItem2: 'حمض الفولفيك 70%',
    humicItem3: 'هيومات بوتاسيوم (رقائق)',
    guidanceTitle: 'الإرشاد الزراعي',
    guidanceText: 'نقدم لك نصائح الخبراء وبرامج التسميد المتكاملة لضمان صحة النبات وجودة المحصول.',
    guide1Title: 'استراتيجيات التسميد الفعّال',
    guide1Text: 'تكامل العناصر: تزويد النبات بالعناصر الكبرى NPK والصغرى مثل الحديد والمغنيسيوم لنمو متوازن. حلول ذكية: استخدام أسمدة الإطلاق المتحكم به لتجنب الإفراط وضمان تدفق المغذيات بوتيرة محكمة. دعم حيوي: تفعيل دور الميكروبات التربوية لزيادة إتاحة العناصر وامتصاص الجذور.',
    guide1Point1: 'تكامل العناصر: تزويد النبات بالعناصر الكبرى NPK والصغرى مثل الحديد والمغنيسيوم لضمان نمو متوازن.',
    guide1Point2: 'حلول ذكية: استخدام أسمدة الإطلاق المتحكم به لتجنب الإفراط وضمان تدفق المغذيات بوتيرة محكمة.',
    guide1Point3: 'دعم حيوي: تفعيل دور الميكروبات التربوية لزيادة إتاحة العناصر وتحسين امتصاص الجذور.',
    guide2Title: 'ثورة الأسمدة السائلة',
    guide2Text: 'سرعة الاستجابة: نوصي بالأسمدة السائلة للامتصاص الفوري والتأثير اللحظي على نمو المحصول. دقة التطبيق: التحكم بالجرعات وتوزيعها بشكل متجانس عبر الرش الورقي أو أنظمة الري.',
    guide2Point1: 'سرعة الاستجابة: نوصي بالأسمدة السائلة للامتصاص الفوري والتأثير اللحظي على نمو المحصول.',
    guide2Point2: 'دقة التطبيق: إمكانية التحكم بالجرعات وتوزيعها بشكل متجانس عبر الرش الورقي أو أنظمة الري.',
    guide2Point3: 'كفاءة أعلى: توزيع منتظم للعناصر الغذائية بما يضمن نموًا متوازنًا في جميع أجزاء الحقل.',
    guide3Title: 'رعاية المحاصيل اليمنية',
    guide3Text: 'الخضروات: التركيز على النيتروجين للنمو الورقي والكالسيوم لحماية الثمار من أمراض ما بعد الحصاد. أشجار الفاكهة: برنامج تسميد مرحلي؛ فوسفور لإنتاج الزهور وبوتاسيوم لتعزيز نكهة وجودة الثمرة.',
    guide3Point1: 'الخضروات: التركيز على النيتروجين للنمو الورقي، والكالسيوم لحماية الثمار من أمراض ما بعد الحصاد.',
    guide3Point2: 'أشجار الفاكهة: برنامج تسميد مرحلي يعتمد على الفوسفور في مرحلة الإزهار.',
    guide3Point3: 'تعزيز جودة الثمار والنكهة عبر دعم البوتاسيوم خلال مرحلة التطور والإثمار.',
    readMore: 'لمعرفة المزيد',
    contactTitle: 'تواصل مع اجروفيكس المتحدة',
    contactText: 'أرسل طلبك وسنقوم بالرد بأقرب وقت.',
    contactDirectTitle: 'للتواصل معنا',
    contactPhoneLabel: 'الهاتف',
    contactEmailLabel: 'البريد الإلكتروني',
    contactAddressLabel: 'العنوان',
    contactAddressValue: 'تعز - الحوبان، اليمن',
    validationName: 'الرجاء إدخال اسم لا يقل عن حرفين.',
    validationEmail: 'الرجاء إدخال بريد إلكتروني صحيح.',
    validationPhone: 'الرجاء إدخال رقم هاتف صحيح.',
    validationMessage: 'يجب أن لا تقل الرسالة عن 10 أحرف.',
    formFixErrors: 'يرجى تصحيح الحقول المظللة قبل الإرسال.',
    formSent: 'شكرًا لك. تم إرسال رسالتك بنجاح.',
    formError: 'تعذر إرسال رسالتك الآن. يرجى المحاولة لاحقًا.',
    labelName: 'الاسم الكامل',
    labelEmail: 'البريد الإلكتروني',
    labelPhone: 'رقم الهاتف',
    labelMessage: 'الرسالة',
    sendMessage: 'إرسال الرسالة',
    footerText: 'أسمدة زراعية متطورة لنمو عالمي مستدام.',
    footerBrand: 'اجروفيكس المتحدة',
    footerTagline: 'نبتكر اليوم.. لنحصد غداً.',
    footerRights: 'جميع الحقوق محفوظة لشركة اجروفيكس المتحدة لصناعة الأسمدة الزراعية',
    terms: 'شروط الاستخدام',
    privacy: 'سياسه الخصوصية',
    quickLinks: 'روابط سريعة',
    followUs: 'تابعنا',
    rights: 'جميع الحقوق محفوظة.'
  }
};

const applyLanguage = (lang) => {
  const normalizedLang = dictionary[lang] ? lang : 'en';
  currentLang = normalizedLang;
  document.documentElement.lang = normalizedLang;
  document.documentElement.dir = normalizedLang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (dictionary[normalizedLang][key]) {
      node.textContent = dictionary[normalizedLang][key];
    }
  });

  langButtons.forEach((btn) => {
    const isActive = btn.dataset.lang === normalizedLang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  refreshProductSliderLanguage();
  updateFormStatusByQuery();
  updateNavigationLabels();

  localStorage.setItem('site-lang', normalizedLang);
};

langButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyLanguage(button.dataset.lang);
  });
});

const savedLang = localStorage.getItem('site-lang') || 'ar';
applyLanguage(savedLang);
