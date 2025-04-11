/* ============================================================
    [Master Stylesheet]

    Theme Name  : iTop        
    Description : iTop- Recharge & Bill Payment, Booking Responsive HTML5 Template.
    Author      : coUI         
    Author URL  : https://themeforest.net/user/coui  
    Version     : 1.0.0

============================================================== */
/*
========================================
*********** TABLE OF CONTENTS **********
 
    01. Header Hide Click On Body
    02. Header Sticky
    03. Scroll To Top
    04. Header Hide Scroll Bar
    05. Small Device Header Menu
    06. Add Attribute For Bg Image
    07. add active class to ul>li
    08. Text Circle
    09. Nice Select
    10. Owl Carousel
    11. Counter
    12. Sidebar Menu
    13. Service
    14. FAQ
    15. AOS
    16. GSAP Code
      - Hero section
      - App section
      - Counter section
      - Blog Details section
      - Service Accordion
      - Hero section
      - Hero section
    17. Cursor
    18. Preloader

========================================
*/

(function ($) {
  'use strict';

  // ============== Header Hide Click On Body Js Start ========
  $('.header-button').on('click', function () {
    $('.body-overlay').toggleClass('show');
  });
  $('.body-overlay').on('click', function () {
    $('.header-button').trigger('click');
    $(this).removeClass('show');
  });
  // =============== Header Hide Click On Body Js End =========

  // // ========================= Header Sticky Js Start ==============
  $(window).on('scroll', function () {
    if ($(window).scrollTop() >= 300) {
      $('.header').addClass('fixed-header');
    } else {
      $('.header').removeClass('fixed-header');
    }
  });
  // // ========================= Header Sticky Js End===================

  // //============================ Scroll To Top Icon Js Start =========
  var btn = $('.scroll-top');

  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 300) {
      btn.addClass('show');
    } else {
      btn.removeClass('show');
    }
  });

  btn.on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({
      scrollTop: 0
    }, '300');
  });

  // ========================== Header Hide Scroll Bar Js Start =====================
  $('.navbar-toggler.header-button').on('click', function () {
    $('body').toggleClass('scroll-hide-sm');
  });
  $('.body-overlay').on('click', function () {
    $('body').removeClass('scroll-hide-sm');
  });
  // ========================== Header Hide Scroll Bar Js End =====================

  // ========================== Small Device Header Menu On Click Dropdown menu collapse Stop Js Start =====================
  $('.dropdown-item').on('click', function () {
    $(this).closest('.dropdown-menu').addClass('d-block');
  });
  // ========================== Small Device Header Menu On Click Dropdown menu collapse Stop Js End =====================

  // ========================== Add Attribute For Bg Image Js Start =====================
  $('.bg-img').css('background', function () {
    var bg = 'url(' + $(this).data('background-image') + ')';
    return bg;
  });
  // ========================== Add Attribute For Bg Image Js End =====================

  // ========================== add active class to ul>li top Active current page Js Start =====================
  function dynamicActiveMenuClass(selector) {
    let fileName = window.location.pathname.split('/').reverse()[0];
    selector.find('li').each(function () {
      let anchor = $(this).find('a');
      if ($(anchor).attr('href') == fileName) {
        $(this).addClass('active');
      }
    });
    // if any li has active element add class
    selector.children('li').each(function () {
      if ($(this).find('.active').length) {
        $(this).addClass('active');
      }
    });
    // if no file name return
    if ('' == fileName) {
      selector.find('li').eq(0).addClass('active');
    }
  }
  if ($('ul.sidebar-menu-list').length) {
    dynamicActiveMenuClass($('ul.sidebar-menu-list'));
  }
  // ========================== add active class to ul>li top Active current page Js End =====================


  // ========================= Text Circle Js Start ===================
  document.querySelectorAll('.footer__circle__text').forEach((circleText) => {
    const textElement = circleText.querySelector("p");
    if (textElement) {
      textElement.innerHTML = textElement.innerText
        .split("")
        .map((char, i) => `<span style="transform:rotate(${i * 7.8}deg)">${char}</span>`)
        .join("");
    }
  });
  // ========================= Text Circle Js End ===================


  // ========================= Nice Select Js Start ===================
  $('select').niceSelect();
  // ========================= Nice Select Js End ===================


  // ========================= Owl Carousel Js Start ===================
  $('.testimonial__wrap').owlCarousel({
    dots: true,
    loop: true,
    nav: false,
    navText: ['<i class="fas fa-long-arrow-alt-left"></i>', '<i class="fas fa-long-arrow-alt-right"></i>'],
    autoplay: true,
    smartSpeed: 2000,
    autoplayTimeout: 2500,
    items: 3,
    margin: 80,
    slideToScroll: 1,
    center: true,
    autoplayHoverPause: true,
    stagePadding: 50,

    responsive: {
      0: {
        items: 1,
        stagePadding: 30,
      },
      320: {
        items: 1,
        stagePadding: 30,
      },
      450: {
        items: 1,
        stagePadding: 30,
      },
      575: {
        items: 2,
        stagePadding: 0,
        margin: 40,
      },
      768: {
        items: 2,
        stagePadding: 0,
        margin: 50,
      },
      992: {
        items: 2,
        stagePadding: 0,
      },
      1100: {
        items: 2,
      },
      1200: {
        items: 3,
      },
      1360: {
        items: 3,
      },
      1449: {
        items: 3,
      },
      1500: {
        items: 3,
      },
      1600: {
        items: 3,
      },
      1700: {
        items: 3,
      }
    }
  });
  // ========================= Owl Carousel Js End ===================


  // ========================= Owl Carousel Js Start ===================
  $('.payment__main__slider').owlCarousel({
    dots: false,
    loop: true,
    nav: false,
    navText: ['<i class="fas fa-long-arrow-alt-left"></i>', '<i class="fas fa-long-arrow-alt-right"></i>'],
    autoplay: true,
    smartSpeed: 3000,
    autoplayTimeout: 4500,
    items: 1,
    margin: 20,
    slideToScroll: 1,
    autoplayHoverPause: false,
  });
  // ========================= Owl Carousel Js End ===================


  // ========================= Owl Carousel Js Start ===================
  $('.service__brand__main').owlCarousel({
    dots: false,
    loop: true,
    nav: false,
    navText: ['<i class="fas fa-long-arrow-alt-left"></i>', '<i class="fas fa-long-arrow-alt-right"></i>'],
    autoplay: true,
    smartSpeed: 3000,
    autoplayTimeout: 2500,
    items: 6,
    margin: 40,
    slideToScroll: 1,
    autoplayHoverPause: false,
    responsive: {
      0: {
        items: 1,
        center: true,
        margin: 20,
      },
      320: {
        items: 2,
        center: true,
        margin: 20,
      },
      450: {
        items: 3,
        center: true,
        margin: 20,
      },
      575: {
        items: 3,
      },
      768: {
        items: 4,
      },
      992: {
        items: 5,
      },
      1100: {
        items: 5,
      },
      1200: {
        items: 6,
      },
    }
  });
  // ========================= Owl Carousel Js End ===================


  // ========================= Counter Js Start ===================
  $('.counter').counterUp({
    delay: 10,
    time: 1000,
  });
  // ========================= Counter Js End ===================


  // ================== Sidebar Menu Js Start ===============
  // Sidebar Dropdown Menu Start
  $(document).on('click', '.has-dropdown > a', function () {
    $('.sidebar-submenu').slideUp(200);
    if ($(this).parent().hasClass('active')) {
      $('.has-dropdown').removeClass('active');
      $(this).parent().removeClass('active');
    } else {
      $('.has-dropdown').removeClass('active');
      $(this).next('.sidebar-submenu').slideDown(200);
      $(this).parent().addClass('active');
    }
  });
  // Sidebar Dropdown Menu End
  // Sidebar Icon & Overlay js
  $('.navigation-bar').on('click', function () {
    $('.sidebar-menu').addClass('show-sidebar');
    $('.sidebar-overlay').addClass('show');
  });
  $('.sidebar-menu__close, .sidebar-overlay').on('click', function () {
    $('.sidebar-menu').removeClass('show-sidebar');
    $('.sidebar-overlay').removeClass('show');
  });
  // Sidebar Icon & Overlay js
  // ===================== Sidebar Menu Js End =================


  // ========================= Service hover add class Js Start =====================
  $(".service__main__single").on("mouseenter", function () {
    $(".service__main__single").removeClass("active");
    $(this).addClass("active");
  });

  $(".service__main__single").on("mouseleave", function () {
    $(".service__main__single").removeClass("active"); // Remove class from all elements
    $(this).addClass("active"); // Add class only to the last hovered element
  });
  // ========================= Service hover add class Js End =====================


  // ========================= FAQ Js Start =====================
  if ($('.accordion').length) {
    const ACCORDION_SELECTOR = '.accordion'; // Accordion container selector
    const ACTIVE_CLASS = 'active'; // Class to toggle on accordion item

    initializeAccordionToggler();

    function initializeAccordionToggler() {
      $(ACCORDION_SELECTOR).on('show.bs.collapse hide.bs.collapse', function (event) {
        const $accordionItem = $(event.target).closest('.accordion-item');

        // Toggle 'active' class based on event type
        $accordionItem.toggleClass(ACTIVE_CLASS, event.type === 'show');
      });
    }
  }
  // ========================= FAQ Js End =====================


  // ========================= AOS Js Start =====================
  AOS.init({
    easing: 'ease-out-back',
  });
  // ========================= AOS Js End =====================


  // ========================= GSAP Js Start =====================

  // 20. Register GSAP
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  if (window.matchMedia("(max-width: 767px)").matches) {

  } else {
    // Hero section
    if ($('.hero__wrap__title').length) {
      gsap.to(".hero__wrap__title", {
        scale: .6, // Target zoom level
        scrollTrigger: {
          trigger: ".hero__thumb",
          start: "top bottom", // Start the animation when the top of the container reaches the center of the viewport
          end: "bottom center", // End the animation when the bottom of the container reaches the top of the viewport
          scrub: true, // Smooth scrubbing
        }
      });
    }

    if ($('.hero__thumb').length) {
      gsap.to(".hero__thumb", {
        scale: 1.1, // Target zoom level
        rotateX: 0,
        scrollTrigger: {
          trigger: ".hero__thumb",
          start: "top bottom", // Start the animation when the top of the container reaches the center of the viewport
          end: "bottom center", // End the animation when the bottom of the container reaches the top of the viewport
          scrub: true, // Smooth scrubbing
        }
      });
    }

    if ($('.hero__thumb__sr1').length) {
      gsap.to(".hero__thumb__sr1", {
        top: -30,
        scrollTrigger: {
          trigger: ".hero__thumb",
          start: "top bottom", // Start the animation when the top of the container reaches the center of the viewport
          end: "bottom top", // End the animation when the bottom of the container reaches the top of the viewport
          scrub: true, // Smooth scrubbing
        }
      });
    }

    if ($('.hero__thumb__sr2').length) {
      gsap.to(".hero__thumb__sr2", {
        top: -60,
        scrollTrigger: {
          trigger: ".hero__thumb",
          start: "top bottom", // Start the animation when the top of the container reaches the center of the viewport
          end: "bottom top", // End the animation when the bottom of the container reaches the top of the viewport
          scrub: true, // Smooth scrubbing
        }
      });
    }
  }


  // App Section
  if ($('.app__main__img').length) {
    gsap.to(".app__main__img", {
      scrollTrigger: {
        trigger: ".app__main__img", // The element you want to make sticky
        start: "top top+=100px", // Start pinning when ".element" reaches the top of the viewport
        endTrigger: ".app__main__platform", // End pinning when ".second-element" enters the viewport
        end: "top center", // End pinning when ".second-element" reaches the center of the viewport
        pin: true, // Makes the element sticky
        pinSpacing: true, // Optional: Adds space for the pinned element
      }
    });
  }

  if ($('.app__main__sp.sp1').length) {
    gsap.to(".app__main__sp.sp1", {
      scrollTrigger: {
        trigger: ".app__main__sp.sp1", // The element you want to make sticky
        start: "top top+=500px", // Start pinning when ".element" reaches the top of the viewport
        endTrigger: ".app__main__platform", // End pinning when ".second-element" enters the viewport
        end: "top bottom", // End pinning when ".second-element" reaches the center of the viewport
        pin: true, // Makes the element sticky
        pinSpacing: true, // Optional: Adds space for the pinned element
      }
    });
  }

  if ($('.app__main__sp.sp2').length) {
    gsap.to(".app__main__sp.sp2", {
      scrollTrigger: {
        trigger: ".app__main__sp.sp2", // The element you want to make sticky
        start: "top top+=500px", // Start pinning when ".element" reaches the top of the viewport
        endTrigger: ".app__main__platform", // End pinning when ".second-element" enters the viewport
        end: "top bottom", // End pinning when ".second-element" reaches the center of the viewport
        pin: true, // Makes the element sticky
        pinSpacing: true, // Optional: Adds space for the pinned element
      }
    });
  }

  if ($('.app__main__sp.sp3').length) {
    gsap.to(".app__main__sp.sp3", {
      scrollTrigger: {
        trigger: ".app__main__sp.sp3", // The element you want to make sticky
        start: "top top+=300px", // Start pinning when ".element" reaches the top of the viewport
        endTrigger: ".app__main__platform", // End pinning when ".second-element" enters the viewport
        end: "top bottom", // End pinning when ".second-element" reaches the center of the viewport
        pin: true, // Makes the element sticky
        pinSpacing: true, // Optional: Adds space for the pinned element
      }
    });
  }

  if ($('.app__main__sp.sp4').length) {
    gsap.to(".app__main__sp.sp4", {
      scrollTrigger: {
        trigger: ".app__main__sp.sp4", // The element you want to make sticky
        start: "top top+=300px", // Start pinning when ".element" reaches the top of the viewport
        endTrigger: ".app__main__platform", // End pinning when ".second-element" enters the viewport
        end: "top bottom", // End pinning when ".second-element" reaches the center of the viewport
        pin: true, // Makes the element sticky
        pinSpacing: true, // Optional: Adds space for the pinned element
      }
    });
  }


  // Counter Section
  if ($('.counter__main__single').length) {
    gsap.to(".counter__main__single", {
      rotate: 0,
      scrollTrigger: {
        trigger: ".counter__main__single",
        start: "top center", // Start the animation when the top of the container reaches the center of the viewport
        end: "bottom bottom", // End the animation when the bottom of the container reaches the top of the viewport
        scrub: true, // Smooth scrubbing
      }
    });
  }


  // Blog Details Section
  if ($('.blog__details__wrap__sidebar').length) {
    gsap.to(".blog__details__wrap__sidebar", {
      scrollTrigger: {
        trigger: ".blog__details__wrap__sidebar",
        start: "top top+=80", // When the top of the sticky element hits the top of the viewport
        endTrigger: ".blog__details__wrap__main",
        end: "bottom center+=400", // When the bottom of the target element hits the top of the viewport
        pin: true, // Make the sticky element "stick" in place
        pinSpacing: false, // Prevent extra space from being added
        scrub: true // Smoothly transition with scroll
      }
    });
  }


  // Service Accordion

  if (window.matchMedia("(max-width: 769px)").matches) {

  } else {
    if ($('.service__details__left').length) {
      gsap.to(".service__details__left", {
        scrollTrigger: {
          trigger: ".service__details__left", // The element you want to make sticky
          start: "top top", // Start pinning when ".element" reaches the top of the viewport
          endTrigger: ".service__details__main", // End pinning when ".second-element" enters the viewport
          end: "bottom bottom", // End pinning when ".second-element" reaches the center of the viewport
          pin: true, // Makes the element sticky
          pinSpacing: true, // Optional: Adds space for the pinned element
        }
      });
    }

    if ($('.service__dsp').length) {
      gsap.to(".service__dsp", {
        scrollTrigger: {
          trigger: ".service__dsp", // The element you want to make sticky
          start: "top top", // Start pinning when ".element" reaches the top of the viewport
          endTrigger: ".service__details__main", // End pinning when ".second-element" enters the viewport
          end: "bottom bottom+=200", // End pinning when ".second-element" reaches the center of the viewport
          pin: true, // Makes the element sticky
          pinSpacing: true, // Optional: Adds space for the pinned element
        }
      });
    }
  }

  // ========================= GSAP Js End =====================


  // ========================= Cursor Js Start =====================
  if ($('.cursor').length) {
    gsap.set(".cursor", {
      xPercent: -50,
      yPercent: -50
    });

    let xTo = gsap.quickTo(".cursor", "x", {
        duration: 0.6,
        ease: "power3"
      }),
      yTo = gsap.quickTo(".cursor", "y", {
        duration: 0.6,
        ease: "power3"
      });

    window.addEventListener("mousemove", e => {
      xTo(e.clientX);
      yTo(e.clientY);
    });
  }
  // ========================= Cursor Js End =====================


  // ========================= Preloader Js Start =====================
  if ($('.preloader').length) {
    $('body').addClass('loading-s');
    $(window).on('load', function () {
      $('.preloader').fadeOut();
      $('body').removeClass('loading-s');
    });
  }
  // ========================= Preloader Js End=====================
})(jQuery);