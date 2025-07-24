document.addEventListener('DOMContentLoaded', function() {
    // --- Initialize Supabase Client ---
    const SUPABASE_URL = 'https://znhdxbgzowificnlcdiq.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaGR4Ymd6b3dpZmljbmxjZGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjU0MzQsImV4cCI6MjA2ODk0MTQzNH0.Vbo9tv6Qgn7EVP4keS2ZWLGTS_1qA9X3j6662JLdsvk';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- Get DOM Elements ---
    const signupModal = document.getElementById('signup-modal');
    const loginModal = document.getElementById('login-modal');
    const headerSignupBtn = document.getElementById('header-signup-btn');
    const mainSignupBtn = document.getElementById('main-signup-btn');
    const headerLoginBtn = document.getElementById('header-login-btn');
    const signupCloseBtn = document.getElementById('signup-close-btn');
    const loginCloseBtn = document.getElementById('login-close-btn');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // --- Modal Controls ---
    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => modal.style.display = 'none';

    headerSignupBtn.addEventListener('click', () => { resetSignupForm(); openModal(signupModal); });
    mainSignupBtn.addEventListener('click', (e) => { e.preventDefault(); resetSignupForm(); openModal(signupModal); });
    headerLoginBtn.addEventListener('click', () => openModal(loginModal));
    signupCloseBtn.addEventListener('click', () => closeModal(signupModal));
    loginCloseBtn.addEventListener('click', () => closeModal(loginModal));
    window.addEventListener('click', (e) => {
        if (e.target == signupModal) closeModal(signupModal);
        if (e.target == loginModal) closeModal(loginModal);
    });

    // --- MODIFIED: Multi-Step Form Logic ---
    let currentStep = 1;
    const totalSteps = 3;
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const createAccountBtn = document.getElementById('create-account-btn');
    const steps = document.querySelectorAll('.signup-step');
    const progressSteps = document.querySelectorAll('.progress-step');

    function updateFormStep() {
        steps.forEach(step => {
            step.classList.toggle('active-step', parseInt(step.dataset.step) === currentStep);
        });
        progressSteps.forEach((step, index) => {
            step.classList.toggle('completed', index < currentStep);
        });
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
        createAccountBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
    }

    function validateStep(stepNumber) {
        const activeStep = document.querySelector(`.signup-step[data-step="${stepNumber}"]`);
        for (const input of activeStep.querySelectorAll('input[required]')) {
            if (!input.value.trim()) {
                alert(`Please fill out the ${input.previousElementSibling.innerText} field.`);
                input.focus();
                return false;
            }
        }
        return true;
    }

    function resetSignupForm() {
        signupForm.reset();
        currentStep = 1;
        updateFormStep();
    }

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateFormStep();
        }
    });

    prevBtn.addEventListener('click', () => {
        currentStep--;
        updateFormStep();
    });
    
    // --- Sign-up Form Submission ---
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        createAccountBtn.disabled = true;
        createAccountBtn.textContent = 'Creating...';

        // Gather data from all steps
        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        const username = document.getElementById('modal-username').value;
        // You can also get other data like fullname, phone, etc. to pass if needed.
        
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');

        const { error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { username: username, referral_code: refCode }
            }
        });

        if (error) {
            alert('Sign-up Error: ' + error.message);
        } else {
            alert('Sign-up successful! Please check your email to verify your account.');
            closeModal(signupModal);
        }
        createAccountBtn.disabled = false;
        createAccountBtn.textContent = 'Create Account';
    });

    // --- Login Form Logic ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Login Failed: ' + error.message);
        } else {
            window.location.href = 'dashboard.html';
        }
    });

    // Initialize the form state
    updateFormStep();
});