/**
 * FAQ 
 * This script ensures proper functioning of the FAQ accordion and popup
 */

// Function to initialize FAQ functionality
function initFAQ() {
    console.log('Initializing FAQ functionality');
    
    // Make sure FAQ items are closed by default
    $('.container-info-faq').hide();
    
    // Unbind previous click events to prevent duplicates
    $(document).off('click', '.faq-btn');
    $(document).off('click', '.close-window');
    $(document).off('click', '.close-faq-item');
    
    // Use event delegation for better performance and to handle dynamic elements
    $(document).on('click', '.faq-btn', function(e) {
        console.log('FAQ button clicked - selector:', this);
        e.preventDefault();
        $('.container-faq').addClass('active-faq');
        return false; // Prevent event bubbling
    });
    
    $(document).on('click', '.close-window', function(e) {
        console.log('Close window button clicked');
        e.preventDefault();
        $('.container-faq').removeClass('active-faq');
        return false; // Prevent event bubbling
    });
    
    $(document).on('click', '.close-faq-item', function(e) {
        console.log('FAQ item clicked');
        e.preventDefault();
        $(this).parent().next('.container-info-faq').slideToggle();
        $(this).toggleClass('item-opened');
        return false; // Prevent event bubbling
    });
    
    // For debugging, log all faq buttons found
    console.log('Found ' + $('.faq-btn').length + ' FAQ buttons');
    
    // Add a click handler directly to each FAQ button
    $('.faq-btn').each(function(index) {
        console.log('Adding click handler to FAQ button #' + index);
        $(this).on('click', function() {
            console.log('Direct FAQ button click handler fired');
            $('.container-faq').addClass('active-faq');
        });
    });
}

// Initialize when DOM is ready
$(document).ready(function() {
    console.log('DOM ready - initializing FAQ');
    initFAQ();
    
    // Also initialize after a short delay to ensure all elements are fully loaded
    setTimeout(function() {
        console.log('Delayed initialization of FAQ');
        initFAQ();
    }, 500);
});

// Fallback initialization if jQuery's ready event has already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already ready - initializing FAQ immediately');
    setTimeout(initFAQ, 1);
}
