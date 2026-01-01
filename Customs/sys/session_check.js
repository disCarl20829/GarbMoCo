document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch('Customs/dbase/session_checker.php', { credentials: 'same-origin' });
        const data = await res.json();

        if (data.isLogged === false) {
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('Session check failed:', err);
        window.location.href = "index.html";
    }
})