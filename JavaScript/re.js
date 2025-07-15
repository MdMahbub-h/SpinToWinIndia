document.addEventListener("DOMContentLoaded", () => {

  let clickIdSet = false;
  let clickIdRequested = false;
  let tgMode = false;
  let exoMode = false;
  let clickIdShortened = false;

  // Main flow:
  (async () => {
    // Step 1: Process TG params
    const tgParam = getQueryParam("tg");
    if (tgParam) {
      const newParams = buildParamsFromTG(tgParam);
      const current = new URL(window.location.href);
      const searchParams = new URLSearchParams(current.search);

      for (const key in newParams) {
        searchParams.set(key, newParams[key]);
      }

      current.search = searchParams.toString();
      window.history.replaceState({}, "", current.toString()); //no-reload
      tgMode = true;
    }

    // Step 2: Check if exoclick
    if (getQueryParam("sub_id5") === "exoclick") {
      exoMode = true;
      const sub_id2 = getQueryParam("sub_id2");
      if (sub_id2) {
        if (sub_id2.startsWith("ex-")) {
          clickIdShortened = true;
        } else {
          await shortenExoClickId();
        }
      }
    }

    // Step 3: Extract country and landing from sub_id3 if needed
    extractCountryAndLanding();

    // Step 4: Get click ID if we don't have one
    if (!getQueryParam("click_id")) {
      await getClickId();
    }
  })();

  function buildParamsFromTG(tg) {
    const parts = tg.split("_");
    if (parts.length < 7) return {};

    const prefix = parts[0];
    const country = parts[1];
    const lang = parts[2];
    const product = parts[3];
    const landing_id = parts[4];
    const pull = parts[5];
    const botname = parts[6] || "unknown";
    const uid = parts[7];

    return {
      landing: landing_id,
      sub_id1: prefix,
      sub_id2: uid,
      sub_id3: `tg_${prefix}_${lang}_${country}_buy-${product}_native_cpc_mix_${landing_id}`,
      sub_id4: pull,
      sub_id5: "tg",
      sub_id6: botname,
      sub_id7: "native",
      sub_id8: lang,
      sub_id9: `buy-${product}`,
      sub_id10: "mix",
      country: country,
      tg: "true",
    };
  }

  async function shortenExoClickId() {
    let longClickId = getQueryParam("sub_id2");
    if (!longClickId) return;

    const url = `https://join4ra.com/api/emin.php?l=${longClickId}&r=${generateRandomString(32)}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.short_id) {
        const url = new URL(window.location);
        url.searchParams.set("sub_id2", data.short_id);
        window.history.replaceState(null, "", url);
        clickIdShortened = true;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Helper function to extract country and landing from sub_id3
  function extractCountryAndLanding() {
    const sub_id3 = getQueryParam("sub_id3");
    const of_id = getQueryParam("of_id");
    if (!sub_id3 || !of_id) return;
  
    const parts = sub_id3.split("_");
    if (parts.length < 9) return;
  
    const country = parts[3];
    const landing = parts[8];
  
    const url = new URL(window.location.href);
    let changed = false;
  
    if (!url.searchParams.get("country")) {
      url.searchParams.set("country", country);
      changed = true;
    }
    if (!url.searchParams.get("landing")) {
      url.searchParams.set("landing", landing);
      changed = true;
    }
  
    if (changed) {
      history.replaceState(null, "", url.toString());
    }
  }
  
  //aln click_id request
  async function getClickId() {

    if (clickIdSet) return;
    if (clickIdRequested) return;
    if (getQueryParam('click_id')) {
      clickIdSet = true;
      return;
    }

    clickIdRequested = true;

    const subParams = [];
    for (let i = 1; i <= 10; i++) {
      const value = getQueryParam(`sub_id${i}`);
      if (value) {
        subParams.push(`sub_id${i}=${encodeURIComponent(value)}`);
      }
    }    

    let land_id = getQueryParam('landing');
    let country_code = getQueryParam('country').toString().toUpperCase();
    let of_id = getQueryParam('of_id') || 'GZd66dwz'; //default

    const url = `https://join4ra.com/api/aln.php?c=${of_id}&country_code=${country_code}&landing=${land_id}&${subParams.join("&")}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      clickIdRequested = false;

      if (data.click_id) {
        clickIdSet = true;
        const url = new URL(window.location);
        url.searchParams.set("click_id", data.click_id);
        window.history.replaceState(null, "", url);
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  const actionChange = document.querySelectorAll(".rp-change");
  const actionButtons = document.querySelectorAll(".rp-btn");
  const clickButtons = document.querySelectorAll(".rp-click");
  const eventButtons = document.querySelectorAll(".rp-event");
  let postbackFired = false;

  function generateRandomString(length, numbers = false) {
    let characters = "abcdefghijklmnopqrstuvwxyz-0123456789";
    if (numbers) {
      characters = "0123456789";
    }
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  function getQueryParam(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results || !results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  actionButtons.forEach((actionButton) => {
    let targetUrl = actionButton.href;
    if (targetUrl !== "#" && !targetUrl.endsWith("#")) {
      actionButton.addEventListener("click", clickRpButton);
    } else {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.target.classList.contains("complete")) {
            let redirectUrl = mutation.target.getAttribute("data-redirectto");
            callRpPostbacks(redirectUrl);
            observer.disconnect();
          }
        });
      });
      observer.observe(actionButton, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  });

  function clickRpButton(event) {
    let targetUrl = this.href;
    if (targetUrl !== "#" && !targetUrl.endsWith("#")) {
      event.preventDefault();
    }
    callRpPostbacks(targetUrl, event);
  }

  clickButtons.forEach((actionButton) => {
    actionButton.addEventListener("click", clickEngagementElement);
  });

  eventButtons.forEach((eventButton) => {
    eventButton.addEventListener("click", clickEngagementElement);
  });

  function clickEngagementElement(event) {
    let targetUrl = "";
    callRpPostbacks(targetUrl, event);
  }

  function callRpPostbacks(targetUrl, event = null) {

    if (tgMode) {
      getClickId();
    
      let wait = 0;
      const interval = 50;
      const start = Date.now();
    
      while (!clickIdSet && wait < 2000) {
        const now = Date.now();
        wait = now - start;
        const end = now + interval;
        while (Date.now() < end) {
        }
      }
    }

    if (postbackFired) {
      if (targetUrl != "") {
        window.location.href = targetUrl;
      }
      return;
    }

    const clickId = getQueryParam("kclickid");
    const tg_param = getQueryParam("tg");
    const postData = new URLSearchParams();
    postData.append("subid", clickId);
    postData.append("tg", tg_param);
    for (let i = 1; i <= 99; i++) {
      const val = getQueryParam(`sub_id${i}`);
      if (val) postData.append(`sub_id${i}`, val);
    }

    if (event) {
      let eventclass = [...event.target.classList]
        .filter((className) => className.startsWith("rp-"))
        .join(" ");
      postData.append("ec", eventclass);
    }

    fetch("https://join4ra.com/api/rprt.php?r=" + generateRandomString(32), {
      method: "POST",
      body: postData,
    })
      .then(() => {
        postbackFired = true;
        if (targetUrl != "") {
          window.location.href = targetUrl;
        }
      })
      .catch((error) => {
        postbackFired = true;
        if (targetUrl != "") {
          window.location.href = targetUrl;
        }
      });
  }

  actionChange.forEach((actionEl) => {
    actionEl.addEventListener("change", reportChange);
  });

  function reportChange() {
    callRpPostbacks("");
  }

  const currentClickId = getQueryParam("click_id");

  function isAbsoluteUrl(url) {
    return /^(?:[a-z]+:)?\/\//i.test(url);
  }

  document.querySelectorAll("a").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (
      currentClickId &&
      href &&
      isAbsoluteUrl(href) &&
      !href.startsWith("#")
    ) {
      const url = new URL(href);
      url.searchParams.set("click_id", currentClickId);
      anchor.setAttribute("href", url.toString());
    }
  });
});
