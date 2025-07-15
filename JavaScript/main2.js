document.addEventListener("DOMContentLoaded", function () {

  // CNV Redirect START
  let cnvRedirectRequired = false;
  const authKeeperUrl = "https://auth-keeper.4rabet-play.com";

  const defaultDomain = "4rabet-play.com";
  const redirectPath = "/?auth=true";

  const sub_id3 = getQueryParam("sub_id3");
  const parts = sub_id3?.split("_");
  const hasCnv = parts?.[1]?.slice(2, 5) === "cnv";

  function setCnvCookie(redirectUrl) {
    const encodedUrl = encodeURIComponent(redirectUrl);
    document.cookie = `cnvCookieUrl=${encodedUrl}; path=/; max-age=315360000`;
  }

  function getCnvCookie() {
    return decodeURIComponent(
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("cnvCookieUrl="))
        ?.split("=")[1] || ""
    );
  }

  if (hasCnv) {
    const cookieVal = getCnvCookie();
    if (cookieVal) {
      checkAuthKeeper(cookieVal);
      cnvRedirectRequired = true;
    }
  }

  async function setAuthKeeper(redirectUrl) {
    const url = new URL(`${authKeeperUrl}/v2.php`);
    url.searchParams.set('set', 'false');
    url.searchParams.set('redirect',redirectUrl);

    try {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      window.location.href = redirectUrl;
    } catch (e) {
      window.location.href = redirectUrl;
    }
  }

  function redirectThroughKeeper(redirectUrl) {
    setAuthKeeper(redirectUrl);
  }

  async function checkAuthKeeper(returnUrl) {

    const url = new URL(`${authKeeperUrl}/v2.php`);
    url.searchParams.set('checked', 'false');
    url.searchParams.set('return',returnUrl);

    try {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.redirectUrl && typeof data.redirectUrl === 'string') {
        try {
          const url = new URL(data.redirectUrl);
          if (url.protocol.startsWith('http')) {
            if (redirectTo !== '') {
              url.pathname = redirectTo;
            }
            const redirectUrl = url.toString();
            window.location.href = redirectUrl;
          }
        } catch (e) {
          // pass
        }
      }
    } catch (e) {
      console.error('Auth keeper error:', e);
    }
  }

  // CNV Redirect END

  const dropdownSelectors = document.querySelectorAll('.drop-select .selected-option');
  const dropdownItems = document.querySelectorAll('.code-item');
  const formWrap = document.querySelector('.form-wrap');
  const formClose = document.querySelectorAll('.form-wrap form .close');
  const regFormElement = document.querySelector('.section.form.reg-form');
  const authFormElement = document.querySelector('.section.form.auth-form');
  const submitRegBtn = document.querySelector('.section.form.reg-form .btn-submit');
  const submitAuthBtn = document.querySelector('.section.form.auth-form .btn-submit');
  const passToggles = document.querySelectorAll('.section.form .passtoggle');
  const btnTabs = document.querySelectorAll('.btn-tab');
  const authModes = document.querySelectorAll('.auth-mode');
  let authVia = "auth-phone";
  const redirectToEl = document.querySelector('.section.form #redirectto');

  let redirectTo = '';
  if (redirectToEl) {
    redirectTo = redirectToEl.getAttribute('data-redirect-to');
  }

  btnTabs.forEach(btn => {
    btn.addEventListener('click', swithPhoneEmail);
  });

  function swithPhoneEmail(event) {
    let mainElement = event.target.closest('a');
    let swMode = mainElement.getAttribute('data-mode');
    authVia = swMode;
    btnTabs.forEach(btn => {
      btn.classList.add('btn-off');
    });
    mainElement.classList.remove('btn-off');
    authModes.forEach(authMode => {
      authMode.style.display = 'none';
      if (authMode.classList.contains(swMode)) {
        authMode.style.display = 'flex';
      }
    });
  }

  formClose.forEach(formCloseBtn => {
    formCloseBtn.addEventListener('click', hideRegistration);
  });

  function hideRegistration() {
    formWrap.classList.remove('show');
  }

  const showRegBtns = document.querySelectorAll('.reg-switch');
  showRegBtns.forEach(btn => {
    btn.addEventListener('click', showRegForm);
  });

  function showRegForm(event) {
    if (regFormElement) {
      regFormElement.style.display = "flex";
    }
    if (authFormElement) {
      authFormElement.style.display = "none";
    }
  }

  const showAuthBtns = document.querySelectorAll('.auth-switch');
  showAuthBtns.forEach(btn => {
    btn.addEventListener('click', showAuthForm);
  });

  function showAuthForm(event) {
    if (regFormElement) {
      regFormElement.style.display = "none";
    }
    if (authFormElement) {
      authFormElement.style.display = "flex";
    }
  }

  dropdownSelectors.forEach(codeSelector => {
    codeSelector.addEventListener('click', toggleCodeDropdown);
  });


  dropdownItems.forEach(dropdownItem => {
    dropdownItem.addEventListener('click', selectCode);
  });

  if (submitRegBtn) {
    submitRegBtn.addEventListener('click', registerFormAction);
  }
  if (submitAuthBtn) {
    submitAuthBtn.addEventListener('click', authFormAction);
  }

  passToggles.forEach(passToggle => {
    passToggle.addEventListener('click', passwordVisibilityToggle);
  });

  function toggleCodeDropdown(event) {
    let codeParrent = event.target.closest('.drop-select');
    if (codeParrent) {
      codeParrent.classList.toggle('open');
    }
  }

  document.addEventListener('click', function (event) {
    dropdownItems.forEach(dropdownItem => {
      let codeParrent = dropdownItem.closest('.drop-select');
      if (codeParrent && !codeParrent.contains(event.target)) {
        codeParrent.classList.remove('open');
      }
    });
  });

  function selectCode(event) {
    let codeParrent = event.target.closest('.drop-select');
    let codeItem = event.target.closest('.code-item');
    let codeSelector = codeParrent.querySelector('.selected-option')
    if (codeParrent) {
      codeParrent.classList.remove('open');
      if (codeSelector) {
        codeSelector.innerHTML = event.target.innerHTML;
        const hiddenCode = codeParrent.querySelector('#phone-code');
        if (hiddenCode) {
          hiddenCode.value = codeItem.getAttribute('data-value');
        }
        const hiddenBonus = codeParrent.querySelector('#bonus');
        if (hiddenBonus) {
          hiddenBonus.value = codeItem.getAttribute('data-value');
        }
        const hiddenCurrency = codeParrent.querySelector('#phone-currency');
        if (hiddenCurrency) {
          hiddenCurrency.value = codeItem.getAttribute('data-phone-currency');
        }
        const hiddenCountry = codeParrent.querySelector('#phone-country');
        if (hiddenCountry) {
          hiddenCountry.value = codeItem.getAttribute('data-phone-country');
        }
      }
    }
  }

  function passwordVisibilityToggle(event) {
    event.target.classList.toggle('off');
    let passWrap = event.target.closest('.passwrap');
    let passwordInput = passWrap.querySelector('#password');
    const isPasswordVisible = passwordInput.getAttribute('type') === 'text';
    passwordInput.setAttribute('type', isPasswordVisible ? 'password' : 'text');
  }

  function registerFormAction(event) {
    event.preventDefault();

    regFormElement.classList.remove('err-email');
    regFormElement.classList.remove('err-password');
    regFormElement.classList.remove('err-tel');
    regFormElement.classList.remove('err-summary');

    let formData = new FormData(regFormElement);
    let type = "1";
    let mode = "?mode=phone";

    let dataFailed = false;
    if (!validateEmail(formData.get('email'))) {
      regFormElement.classList.add('err-email');
      //dataFailed = true;
    }

    if (!validatePassword(formData.get('password'))) {
      regFormElement.classList.add('err-password');
      dataFailed = true;
    }

    if (!validateTel(formData.get('tel'), formData.get('phone-code'))) {
      regFormElement.classList.add('err-tel');
      dataFailed = true;
    }

    if (dataFailed) {
      return;
    }

    let payload = {
      bonus_id: Number(formData.get('bonus')),
      checkbox1: true,
      checkbox2: true,
      confirm_subscribers: ["news"],
      currency: formData.get('phone-currency'),
      form_id: "c3po",
      is_promo: false,
      password: formData.get('password'),
      phone_code: formData.get('phone-country'),
      username: formData.get('phone-code') + formData.get('tel'),
      set_deposit_modal_type: false,
      user_device: "web_browser",
      type: type,
      has_new_password_rules: "0",
      click_id: getQueryParam("click_id"),
      offer_id: getQueryParam("value_1"),
      partner_id: getQueryParam("value_2"),
      landing_id: getQueryParam("value_3"),
    };

    if (formData.get('email') && formData.get('email') !== "") {
      payload.username = formData.get('email');
      payload.phone = formData.get('phone-code') + formData.get('tel');
      payload.type = "2";
      mode = '';
    }

    try {
      raLoad();
      fetch(`https://api-join4ra.pro4biz.com/api/v1/register${mode}`, {
        method: 'POST',
        headers: {
          "accept": "application/json, text/plain, */*",
          "content-type": "application/json",
        },
        body: JSON.stringify(payload)
      })
        .then(response => {
          raLoadOff();
          return response.json();
        })
        .then(data => {
          if (data.redirect_url) {

            const url = new URL(data.redirect_url);
            const urlParams = new URLSearchParams(url.search);

            urlParams.set('offer_id', getQueryParam("value_1"));
            urlParams.set('partner_id', getQueryParam("value_2"));
            urlParams.set('landing_id', getQueryParam("value_3"));

            if (redirectTo !== '') {
              url.pathname = redirectTo;
            } else {
              urlParams.set('deposit', '1');
            }

            url.search = urlParams.toString();
            redirectUrl = url.toString();
            raLoad();

            const domainFromUrl = url.hostname;
            setCnvCookie(redirectUrl);

            if (typeof pushsender !== 'undefined' && pushsender) {
              pushsender.addSubscriberToTag(11579);
              setTimeout(() => {
                redirectThroughKeeper(redirectUrl);
              }, 1000);
            } else {
              redirectThroughKeeper(redirectUrl);
            }

          } else {
            raLoadOff();
            regFormElement.classList.add('err-summary');
          }
        })
        .catch(error => {
          raLoadOff();
          regFormElement.classList.add('err-summary');
        });
    } catch (error) {
      raLoadOff();
      regFormElement.classList.add('err-summary');
    };
  }

  function authFormAction(event) {
    event.preventDefault();

    authFormElement.classList.remove('err-summary');
    authFormElement.classList.remove('err-email');
    authFormElement.classList.remove('err-password');
    authFormElement.classList.remove('err-tel');

    let formData = new FormData(authFormElement);
    let useName = '';

    let dataFailed = false;
    switch (authVia) {
      case 'auth-email':
        useName = formData.get('email');
        if (!validateEmail(formData.get('email'), true)) {
          authFormElement.classList.add('err-email');
          dataFailed = true;
        }
        break;
      case 'auth-phone':
        useName = formData.get('phone-code') + formData.get('tel');
        if (!validateTel(formData.get('tel'))) {
          authFormElement.classList.add('err-tel');
          dataFailed = true;
        }
        break;
      default:
        useName = '';
    }

    let payload = {
      password: formData.get('password'),
      username: useName,
    };

    if (!validateAuthPassword(formData.get('password'))) {
      authFormElement.classList.add('err-password');
      dataFailed = true;
    }

    if (dataFailed) {
      return;
    }

    try {
      raLoad();
      fetch('https://api-join4ra.pro4biz.com/api/v1/login', {
        method: 'POST',
        headers: {
          "accept": "application/json, text/plain, */*",
          "content-type": "application/json",
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          raLoadOff();
          if (data.redirect_url) {
            const url = new URL(data.redirect_url);
            const urlParams = new URLSearchParams(url.search);

            urlParams.set('offer_id', getQueryParam("value_1"));
            urlParams.set('partner_id', getQueryParam("value_2"));
            urlParams.set('landing_id', getQueryParam("value_3"));

            if (redirectTo !== '') {
              url.pathname = redirectTo;
            } else {
              urlParams.set('deposit', '1');
            }

            url.search = urlParams.toString();
            redirectUrl = url.toString();
            raLoad();
            redirectThroughKeeper(redirectUrl);
          } else {
            authFormElement.classList.add('err-summary');
          }
        })
        .catch(error => {
          authFormElement.classList.add('err-summary');
        });
    } catch (error) {
      authFormElement.classList.add('err-summary');
    };
  }

  function validateEmail(email, auth = false) {
    if ((email == '' || !email) && !auth) { return true; }
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  function validateAuthPassword(password) {
    return password.length >= 6;
  }

  function validatePassword(password) {
    const uniqueChars = new Set(password);
    return uniqueChars.size >= 3 && password.length >= 6;
  }

  function validateTel(tel, code = '+91') {
    if (!/^\d+$/.test(tel)) {
      return false;
    }

    let rmin = 10;
    let rmax = 10;

    switch (code) {
      case '+55':
        rmin = 10;
        rmax = 11;
        break;
      case '+880':
        rmin = 6;
        rmax = 10;
        break;
      default:
        rmin = 10;
        rmax = 10;
    }

    return tel.length >= rmin && tel.length <= rmax;
  }

  function getQueryParam(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results || !results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  const showRegElements = document.querySelectorAll('.show-reg');
  showRegElements.forEach(element => {
    element.addEventListener('click', showRegistration);
  });

  function showRegistration() {
    formWrap.classList.add('show');
  }

  window.showRegistration = showRegistration;

  function toggleConfirmAll(event) {
    console.log(event);
    const checkbox = event.target;
    console.log(checkbox);
    const form = checkbox.closest('form');
    console.log(form);
    if (form) {
      const submitButton = form.querySelector('a.btn.btn-submit');
      console.log(submitButton);
      if (submitButton) {
        submitButton.classList.toggle('disabled', !checkbox.checked);
      }
    }
  }

  const toggleConfirmAllEl = document.querySelector('.confirmall');
  if (toggleConfirmAllEl) {
    toggleConfirmAllEl.addEventListener('click', toggleConfirmAll);
  }

  function raLoad() {
    const loader = document.querySelector(".ra-loader-wrap");
    if (loader) {
      loader.style.display = "flex";
    }
  }
  function raLoadOff() {
    const loader = document.querySelector(".ra-loader-wrap");
    if (loader) {
      loader.style.display = "none";
    }
  }

  const currentClickId = getQueryParam('click_id');
  function isAbsoluteUrl(url) {
    return /^(?:[a-z]+:)?\/\//i.test(url);
  }

  document.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (currentClickId && href && isAbsoluteUrl(href) && !href.startsWith('#')) {
      const url = new URL(href);
      url.searchParams.set('click_id', currentClickId);
      anchor.setAttribute('href', url.toString());
    }
  });
});

window.addEventListener('pageshow', function () {
  const toggleConfirmAllEl = document.querySelector('.confirmall');
  if (toggleConfirmAllEl) {
    toggleConfirmAllEl.checked = true;
    const form = toggleConfirmAllEl.closest('form');
    if (form) {
      const submitButton = form.querySelector('a.btn.btn-submit');
      if (submitButton) {
        if (toggleConfirmAllEl.checked) {
          submitButton.classList.remove('disabled');
        } else {
          submitButton.classList.add('disabled');
        }
      }
    }
  }
});