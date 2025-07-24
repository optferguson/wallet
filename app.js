document.addEventListener('DOMContentLoaded', function() {
    // --- Initialize Supabase Client with your new project details ---
    const SUPABASE_URL = 'https://znhdxbgzowificnlcdiq.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaGR4Ymd6b3dpZmljbmxjZGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjU0MzQsImV4cCI6MjA2ODk0MTQzNH0.Vbo9tv6Qgn7EVP4keS2ZWLGTS_1qA9X3j6662JLdsvk';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- Get DOM Elements ---
    const cryptoGrid = document.querySelector('.crypto-grid');
    const signupModal = document.getElementById('signup-modal');
    const loginModal = document.getElementById('login-modal');
    const headerSignupBtn = document.getElementById('header-signup-btn');
    const mainSignupBtn = document.getElementById('main-signup-btn');
    const headerLoginBtn = document.getElementById('header-login-btn');
    const signupCloseBtn = document.getElementById('signup-close-btn');
    const loginCloseBtn = document.getElementById('login-close-btn');
    const loginSuccessPrompt = document.getElementById('login-success-prompt');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // --- Modal Controls ---
    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => modal.style.display = 'none';

    headerSignupBtn.addEventListener('click', () => openModal(signupModal));
    mainSignupBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(signupModal); });
    headerLoginBtn.addEventListener('click', () => openModal(loginModal));
    signupCloseBtn.addEventListener('click', () => closeModal(signupModal));
    loginCloseBtn.addEventListener('click', () => closeModal(loginModal));
    window.addEventListener('click', (e) => {
        if (e.target == signupModal) closeModal(signupModal);
        if (e.target == loginModal) closeModal(loginModal);
    });

    // --- Sign-up Form Logic ---
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const createAccountBtn = signupForm.querySelector('button[type="submit"]');
        createAccountBtn.disabled = true;
        createAccountBtn.textContent = 'Creating...';

        const username = document.getElementById('modal-username').value;
        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        
        // MODIFIED: Capture the referral code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    referral_code: refCode // Pass the referral code to the backend
                }
            }
        });

        if (error) {
            alert('Sign-up Error: ' + error.message);
            createAccountBtn.disabled = false;
            createAccountBtn.textContent = 'Create Account';
        } else {
            // Send EmailJS notification with your new credentials
            const serviceID = 'service_6x6x4xi';
            const templateID = 'template_0r6pgol';
            const publicKey = 'A5gV8r6I-iFx23i56';
            emailjs.send(serviceID, templateID, { to_name: username, to_email: email }, publicKey)
                .catch(err => console.error("EmailJS Error:", err));
            
            closeModal(signupModal);
            loginSuccessPrompt.style.display = 'block';
            openModal(loginModal);
        }
    });

    // --- Login Form Logic ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginButton = loginForm.querySelector('button[type="submit"]');
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Login Failed: ' + error.message);
            loginButton.disabled = false;
            loginButton.textContent = 'Log in';
        } else {
            window.location.href = 'dashboard.html';
        }
    });

    // --- Dynamic Crypto Price Display ---
    async function fetchCryptoPrices() {
        if (!cryptoGrid) return;
        const coinIds = 'bitcoin,ethereum,tether,solana,binancecoin,ripple';
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}`);
            const data = await response.json();
            cryptoGrid.innerHTML = data.map(coin => {
                const change = coin.price_change_percentage_24h || 0;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                return `
                    <div class="crypto-card">
                        <div class="crypto-title">
                            <img src="${coin.image}" alt="${coin.name}" class="crypto-logo">
                            <span class="crypto-name">${coin.name}</span>
                        </div>
                        <div class="crypto-price">$${coin.current_price.toLocaleString()}</div>
                        <div class="crypto-change ${changeClass}">${change.toFixed(2)}%</div>
                    </div>`;
            }).join('');
        } catch (error) {
            console.error("Failed to fetch crypto prices:", error);
        }
    }

    fetchCryptoPrices();
});