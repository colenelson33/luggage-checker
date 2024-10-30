// Optional: If you want the animation to restart every time the page loads
window.onload = function() {
    const typingText = document.querySelector('.typing-text');
    typingText.style.animation = 'none';
    setTimeout(() => {
        typingText.style.animation = '';
    }, 10);
};
