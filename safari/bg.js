chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "https://www.perplexity.ai/" });
});

chrome.runtime.onInstalled.addListener((details) => {
  // uninstalling redirects to homepage with query param, homepage triggers uninstall analytics event
  chrome.runtime.setUninstallURL("https://www.perplexity.ai/?uninstall_default_search_extension=true");

  chrome.cookies.get({ url: 'https://www.perplexity.ai/', name: 'pplx.visitor-id' }, (cookie) => {
    if (!cookie.value) {
      return;
    }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      postEvent('default search extension installed', cookie);
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
      postEvent('default search extension updated', cookie);
    }
  });
});

function postEvent(eventName, cookie) {
  // TODO: migrate to rest async api endpoint when ready
  fetch('https://www.perplexity.ai/p/api/v1/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        event_name: eventName,
        event_data: {
          isBrowserExtension: true,
        },
        url: 'extension',
        referrer: '',
        language: 'en-US',
        screen: 'extension',
        hostname: 'www.perplexity.ai',
        source: 'extension',
        visitor_id: cookie ? cookie.value : '',
      }
   ),
  });
}
