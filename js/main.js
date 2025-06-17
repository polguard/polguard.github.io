const closeWindow = () => {
    $('.container-wallet-list').removeClass('active-container-wallet');
    $('.container-bg-wallet-list').removeClass('active-bg-wallet-list');
}

// This function must be in global scope as it's referenced in observables.js
function showWalletSelection() {
    console.log('Show wallet selection modal');
    // If there's a wallet connection modal, show it
    if ($('.container-wallet-list').length) {
        $('.container-wallet-list').addClass('active-container-wallet');
        $('.container-bg-wallet-list').addClass('active-bg-wallet-list');
    } else {
        // If no modal exists, call the connect button directly
        $('#connectBtn').click();
    }
}

function showWarningPopup(title, message, timeout = 0) {
    $('#warnTitleContent').text(title);
    $('#warnMainContent').text(message);
    $('#warn').addClass('active-warn');
    if (timeout > 0) {
        setTimeout(() => {
            $('#warn').removeClass('active-warn');
        }, timeout);
    }
}

function showErrorPopup(title, message, timeout = 0) {
    $('#errorTitleContent').text(title);
    $('#errorMainContent').text(message);
    $('#warn1').addClass('active-warn');
    if (timeout > 0) {
        setTimeout(() => {
            $('#warn1').removeClass('active-warn');
        }, timeout);
    }
}

$(document).ready(function() {
    $('.warn-btn').click(function() {
        $(this).closest('.warn-container').removeClass('active-warn');
    });
    
    // Note: FAQ functionality has been moved to faq.js
});

// Note: The slider functionality is now handled in slider_drag.js
