(function () {
  'use strict';

  var measurementId = 'G-ZHGNBT5JTW';
  var storageKey = 'welten-analytics-consent-v1';
  var consent = null;
  var tagLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function readConsent() {
    try {
      var value = window.localStorage.getItem(storageKey);
      return value === 'granted' || value === 'denied' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeConsent(value) {
    try { window.localStorage.setItem(storageKey, value); } catch (error) {}
  }

  function loadGoogleTag() {
    if (tagLoaded) return;
    tagLoaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true });
  }

  function updateConsent(value) {
    consent = value;
    writeConsent(value);
    window.gtag('consent', 'update', { analytics_storage: value });
    if (value === 'granted') {
      loadGoogleTag();
    }
  }

  function track(name, parameters) {
    if (consent === 'granted') {
      window.gtag('event', name, parameters || {});
    }
  }

  window.weltenAnalytics = {
    trackLead: function (leadType) {
      track('generate_lead', {
        lead_type: leadType,
        page_language: document.documentElement.lang || '',
        page_location: window.location.href
      });
    }
  };

  function createBanner() {
    var isGerman = (document.documentElement.lang || '').toLowerCase().indexOf('de') === 0;
    var copy = isGerman ? {
      title: 'Deine Privatsphäre',
      text: 'Wir verwenden optionale Google-Analytics-Cookies, um zu verstehen, wie unsere Website genutzt wird. Du kannst sie akzeptieren oder ablehnen.',
      accept: 'Analyse akzeptieren',
      reject: 'Nur notwendige Cookies',
      link: 'Mehr erfahren',
      privacy: '/de/datenschutz/#cookies',
      label: 'Cookie-Einstellungen'
    } : {
      title: 'Your privacy',
      text: 'We use optional Google Analytics cookies to understand how our website is used. You can accept or decline them.',
      accept: 'Accept analytics',
      reject: 'Necessary cookies only',
      link: 'Learn more',
      privacy: '/en/privacy/#cookies',
      label: 'Cookie settings'
    };

    var banner = document.createElement('section');
    banner.className = 'cookie-consent';
    banner.setAttribute('aria-label', copy.label);
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = '<h2>' + copy.title + '</h2>' +
      '<p>' + copy.text + ' <a href="' + copy.privacy + '">' + copy.link + '</a></p>' +
      '<div class="cookie-consent__actions">' +
      '<button class="cookie-consent__button cookie-consent__button--accept" type="button" data-consent="granted">' + copy.accept + '</button>' +
      '<button class="cookie-consent__button cookie-consent__button--reject" type="button" data-consent="denied">' + copy.reject + '</button>' +
      '</div>';
    document.body.appendChild(banner);

    banner.addEventListener('click', function (event) {
      var button = event.target.closest('[data-consent]');
      if (!button) return;
      updateConsent(button.getAttribute('data-consent'));
      banner.classList.remove('is-visible');
    });

    document.addEventListener('click', function (event) {
      var settingsLink = event.target.closest('a[href$="#cookies"], [data-cookie-settings]');
      if (!settingsLink || settingsLink.closest('.cookie-consent')) return;
      event.preventDefault();
      banner.classList.add('is-visible');
      var firstButton = banner.querySelector('button');
      if (firstButton) firstButton.focus();
    });

    if (consent === null) banner.classList.add('is-visible');
  }

  consent = readConsent();
  if (consent === 'granted') {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    loadGoogleTag();
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-google-booking]')) {
      window.weltenAnalytics.trackLead('appointment_booking_click');
    }
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBanner);
  } else {
    createBanner();
  }
})();
