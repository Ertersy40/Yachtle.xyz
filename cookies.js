document.getElementById('acceptAllCookies').addEventListener('click', function() {
    gtag('event', 'cookies_accepted', {
        'event_category': 'cookie Interaction',
        'event_label': 'cookies accepted'
    });
    initGoogleAnalytics(); 
    initGoogleAdsense();
    // Set your cookie or localStorage here
    document.getElementById('cookieConsentBanner').style.display = 'none';
    localStorage.setItem('cookieConsent', JSON.stringify({analytics: true, advertising: true}));
});
document.getElementById('acceptAllCookieSettings').addEventListener('click', function() {
    gtag('event', 'cookies_accepted', {
        'event_category': 'cookie Interaction',
        'event_label': 'cookies accepted'
    });
    initGoogleAnalytics(); 
    initGoogleAdsense();
    // Set your cookie or localStorage here
    document.getElementById('cookieConsentBanner').style.display = 'none';
    document.getElementById('cookieSettingsModal').style.display = 'none';
    localStorage.setItem('cookieConsent', JSON.stringify({analytics: true, advertising: true}));
});

document.getElementById('cookieSettings').addEventListener('click', function() {
    // Toggle the display of the cookie settings modal
    var modal = document.getElementById('cookieSettingsModal');
    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    // Populate modal with settings options
    
    
    // Save settings button functionality
    document.getElementById('saveCookieSettings').addEventListener('click', function() {
        // Implement saving of selected settings, then hide modal
        modal.style.display = 'none';
        document.getElementById('cookieConsentBanner').style.display = 'none';
        const analyticsChecked = document.getElementById('AnalyticsSwitch').checked;
        const advertisingChecked = document.getElementById('AdvertisingSwitch').checked
        if (analyticsChecked){
            initGoogleAnalytics(); 
        }
        if (advertisingChecked){
            initGoogleAdsense();
        }
        if (analyticsChecked && advertisingChecked){
            gtag('event', 'cookies_accepted', {
                'event_category': 'cookie Interaction',
                'event_label': 'cookies accepted'
            });
            
        }else{
            gtag('event', 'cookies_altered', {
                'event_category': 'cookie Interaction',
                'event_label': 'cookies altered'
            });
        }

        localStorage.setItem('cookieConsent', JSON.stringify({analytics: analyticsChecked, advertising: advertisingChecked}));
    });
});

// Example function to check cookie/localStorage consent
function checkCookieConsent() {
    var consent = localStorage.getItem('cookieConsent');
    if (consent) {
        consent = JSON.parse(consent);
        if (consent.analytics) {
            initGoogleAnalytics(); // Initialize Google Analytics if consented
        }
        if (consent.advertising) {
            initGoogleAdsense(); // Initialize Google Adsense if consented
        }
    } else {
        // Display cookie consent banner if no consent is found
        var ccb = document.querySelector('.cookie-consent-banner').style;
        ccb.display = 'block';
        ccb.transform = 'translateY(0)';
    }
}


// Initialize Google Analytics
function initGoogleAnalytics() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-TCKG7Q93BE');
}

// Initialize Google Adsense
function initGoogleAdsense() {
    // (adsbygoogle = window.adsbygoogle || []).push({
    //     google_ad_client: "ca-pub-9512385908704001",
    //     enable_page_level_ads: true
    // });
    
}

// Call checkCookieConsent on page load
window.onload = checkCookieConsent;
