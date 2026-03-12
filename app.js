/* ============================================
   TOM BARBEARIA – App Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // CONFIGURATION
    // =====================
    const CONFIG = {
        // ⚠️ ALTERE PARA O NÚMERO DO PROPRIETÁRIO (com código do país)
        whatsappNumber: '5511958528689',
        businessName: 'Tom Barbearia',
    };

    // =====================
    // DOM ELEMENTS
    // =====================
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const bookingForm = document.getElementById('booking-form');
    const serviceButtons = document.querySelectorAll('.select-service');
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    const timeInputHidden = document.getElementById('client-time');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const selectedServiceIds = []; // guarda os data-values selecionados
    const phoneInput = document.getElementById('client-phone');
    const dateInput = document.getElementById('client-date');
    // =====================
    // LOCAL STORAGE (PREFILL)
    // =====================
    // Funcionalidade desativada a pedido do usuário p/ manter campos limpos.

    // =====================
    // HEADER SCROLL EFFECT
    // =====================
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
        updateActiveNavLink();
    });

    // =====================
    // SCROLL GLOW EFFECT FOR SERVICES
    // =====================
    const glowCards = document.querySelectorAll('.service-card');
    const glowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-glow');
                setTimeout(() => {
                    if (entry.target) entry.target.classList.remove('scroll-glow');
                }, 1200);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px"
    });

    glowCards.forEach(card => glowObserver.observe(card));

    // =====================
    // MOBILE MENU
    // =====================
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    }

    function closeMenu() {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // =====================
    // ACTIVE NAV LINK
    // =====================
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // =====================
    // SCROLL REVEAL
    // =====================
    const revealElements = document.querySelectorAll(
        '.service-card, .booking-info-card, .booking-form, .about-wrapper, .section-header, .stat'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // =====================
    // SERVICE CARD → BOOKING
    // =====================
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceName = btn.getAttribute('data-service');
            const servicePrice = btn.getAttribute('data-price');
            // Encontrar os botões correspondentes e marcá-selected
            const allChips = document.querySelectorAll('.service-chip');
            allChips.forEach(chip => {
                if(serviceName.includes(chip.getAttribute('data-value'))) {
                    chip.classList.add('selected');
                    
                    // Adicionar ao array se não existir
                    const val = chip.getAttribute('data-value');
                    if (!selectedServiceIds.includes(val)) {
                        selectedServiceIds.push(val);
                    }
                }
            });
            updateHiddenServiceInput();
            
            if (dateInput.value) {
                renderTimeSlots();
            }

            // Scroll to booking
            document.getElementById('agendamento').scrollIntoView({ behavior: 'smooth' });

            // Focus on name field after scroll
            setTimeout(() => {
                document.getElementById('client-name').focus();
            }, 800);

            showToast(`Serviço selecionado: ${serviceName} – ${servicePrice}`);
        });
    });

    // =====================
    // PHONE MASK
    // =====================
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 10) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }

        e.target.value = value;
    });

    // =====================
    // SET MIN DATE
    // =====================
    const today = new Date();
    // Ajuste fuso (BRT) ou local para não voltar um dia
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const minDateStr = today.toISOString().split('T')[0];
    dateInput.setAttribute('min', minDateStr);

    // Todos os horários de operação
    const ALL_TIME_SLOTS = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
        "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
        "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
    ];

    const SERVICE_DURATION_MAP = {
        "Corte - R$37": 30,
        "Barba - R$30": 30,
        "Pézinho - R$10": 30,
        "Sobrancelha - R$10": 30,
        "Alisamento - A partir de R$25": 30,
        "Progressiva - A partir de R$60": 30,
        "Luzes - A partir de R$50": 30,
        "Botox Capilar - A partir de R$50": 30
    };

    let currentBookedTimes = [];

    // =====================
    // SERVICES CHIP LOGIC
    // =====================
    const serviceChips = document.querySelectorAll('.service-chip');
    const serviceInputHidden = document.getElementById('client-service');

    function updateHiddenServiceInput() {
        serviceInputHidden.value = selectedServiceIds.join(', ');
        
        // Remove error state automatically when something is selected
        const group = document.getElementById('client-service-grid').closest('.form-group');
        if (selectedServiceIds.length > 0) {
            group.classList.remove('error');
        }

        // Re-render time slots if date is already chosen
        if (dateInput.value) {
            renderTimeSlots();
        }
    }

    serviceChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const val = chip.getAttribute('data-value');
            
            if (chip.classList.contains('selected')) {
                // Remove
                chip.classList.remove('selected');
                const index = selectedServiceIds.indexOf(val);
                if (index > -1) selectedServiceIds.splice(index, 1);
            } else {
                // Add
                chip.classList.add('selected');
                selectedServiceIds.push(val);
            }
            
            updateHiddenServiceInput();
        });
    });

    dateInput.addEventListener('change', async (e) => {
        const selectedDate = e.target.value;
        if (!selectedDate) return;

        timeSlotsGrid.innerHTML = `
            <div class="time-slot-placeholder" style="grid-column: 1 / -1;">
                <i data-lucide="loader-2" class="lucide-spin"></i>
                <span>Buscando horários disponíveis...</span>
            </div>
        `;
        if (window.lucide) lucide.createIcons();

        try {
            // Consultar Firebase para buscar agendamentos na data selecionada
            const querySnapshot = await window.db.collection("agendamentos").where("date", "==", selectedDate).get();
            
            // Mapear quais horários já estão ocupados no Firebase
            currentBookedTimes = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.timeSlots && Array.isArray(data.timeSlots)) {
                    currentBookedTimes.push(...data.timeSlots);
                } else if (data.time) {
                    currentBookedTimes.push(data.time);
                }
            });

            renderTimeSlots();
        } catch (error) {
            console.error("Erro ao buscar horários: ", error);
            timeSlotsGrid.innerHTML = `
                <div class="time-slot-placeholder">
                    <i data-lucide="alert-circle" style="color: #e74c3c"></i>
                    <span>Erro ao conectar. Tente novamente.</span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }
    });

    function renderTimeSlots() {
        timeSlotsGrid.innerHTML = '';
        timeInputHidden.value = ''; // Reset selection

        if (ALL_TIME_SLOTS.length === currentBookedTimes.length) {
            timeSlotsGrid.innerHTML = `
                <div class="time-slot-placeholder">
                    <i data-lucide="calendar-off" style="color: var(--orange)"></i>
                    <span>Esgotado! Nenhum horário sobrando neste dia.</span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        // 1 chip selecionado = 30 min (1 slot). 3 chips = 90 min (3 slots);
        // Cada serviço vale 30 mins
        const BASE_DURATION_PER_SERVICE = 30;
        let totalDuration = 0;
        
        selectedServiceIds.forEach(() => {
            totalDuration += BASE_DURATION_PER_SERVICE;
        });

        // Previne agendamento sem escolha de servico
        if (totalDuration === 0) {
            timeSlotsGrid.innerHTML = `
                <div class="time-slot-placeholder" style="border: 1px dashed var(--orange)">
                    <i data-lucide="scissors" style="color: var(--orange); margin-bottom: 8px;"></i>
                    <span>Por favor, selecione os serviços desejados acima primeiro.</span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        const requiredSlots = Math.ceil(totalDuration / 30);

        let availableCount = 0;

        ALL_TIME_SLOTS.forEach((time, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'time-slot';
            btn.textContent = time;

            // Checar se há slots contíguos suficientes a partir deste startTime
            let canBook = true;
            for (let i = 0; i < requiredSlots; i++) {
                const targetSlotIndex = index + i;
                if (targetSlotIndex >= ALL_TIME_SLOTS.length) {
                    canBook = false; // Ultrapassa horário de fechamento
                    break;
                }
                if (currentBookedTimes.includes(ALL_TIME_SLOTS[targetSlotIndex])) {
                    canBook = false; // Bate em um horário já agendado
                    break;
                }
            }

            if (!canBook) {
                btn.disabled = true;
                btn.title = "Espaço insuficiente para a duração deste serviço";
            } else {
                availableCount++;
                btn.addEventListener('click', () => selectTimeSlot(btn, time));
            }

            timeSlotsGrid.appendChild(btn);
        });

        if (availableCount === 0) {
            timeSlotsGrid.innerHTML = `
                <div class="time-slot-placeholder">
                    <i data-lucide="clock" style="color: var(--orange)"></i>
                    <span>Não há bloco de tempo longo o suficiente para este serviço.</span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }
    }

    function selectTimeSlot(selectedBtn, timeValue) {
        // Remover 'selected' de todos os botões
        const allBtns = timeSlotsGrid.querySelectorAll('.time-slot');
        allBtns.forEach(b => b.classList.remove('selected'));

        // Adicionar 'selected' apenas no clicado
        selectedBtn.classList.add('selected');
        
        // Atribuir ao input escondido
        timeInputHidden.value = timeValue;

        // Limpar erro, se houver
        const group = timeSlotsGrid.closest('.form-group');
        if (group) group.classList.remove('error');
    }

    // =====================
    // FORM VALIDATION
    // =====================
    function validateField(fieldId, condition) {
        const group = document.getElementById(fieldId).closest('.form-group');
        if (!condition) {
            group.classList.add('error');
            return false;
        } else {
            group.classList.remove('error');
            return true;
        }
    }

    // Real-time validation - remove error on input
    const formInputs = bookingForm.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            if (group) group.classList.remove('error');
        });
        input.addEventListener('change', () => {
            const group = input.closest('.form-group');
            if (group) group.classList.remove('error');
        });
    });

    // =====================
    // FORM SUBMISSION → FIREBASE & WHATSAPP
    // =====================
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const service = document.getElementById('client-service').value;
        const date = document.getElementById('client-date').value;
        const time = document.getElementById('client-time').value;
        const notes = document.getElementById('client-notes').value.trim();

        // Validate
        let isValid = true;
        isValid = validateField('client-name', name.length >= 3) && isValid;
        isValid = validateField('client-phone', phone.replace(/\D/g, '').length >= 10) && isValid;
        isValid = validateField('client-service', selectedServiceIds.length > 0) && isValid;
        isValid = validateField('client-date', date !== '') && isValid;
        
        // Specific validation for time buttons
        const timeGroup = timeSlotsGrid.closest('.form-group');
        if (!time) {
            timeGroup.classList.add('error');
            isValid = false;
        } else {
            timeGroup.classList.remove('error');
        }

        if (!isValid) {
            showToast('⚠️ Preencha todos os campos obrigatórios');
            return;
        }
        // Disable Submit Button temporarily
        const submitBtn = document.getElementById('submit-booking');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon"><i data-lucide="loader-2" class="lucide-spin"></i></span> Processando...';
        submitBtn.style.opacity = '0.7';
        if (window.lucide) lucide.createIcons();

        try {
            // Calcular array de slots consumidos a gravar com os novos chips de serviço
            const BASE_DURATION = 30;
            let totalDurationMin = selectedServiceIds.length * BASE_DURATION;
            // Segurança caso chegue vazio
            if(totalDurationMin === 0) totalDurationMin = BASE_DURATION;
            
            const requiredSlots = Math.ceil(totalDurationMin / 30);
            const startIndex = ALL_TIME_SLOTS.indexOf(time);
            
            const timeSlotsToBook = [];
            for (let i = 0; i < requiredSlots; i++) {
                if (ALL_TIME_SLOTS[startIndex + i]) {
                    timeSlotsToBook.push(ALL_TIME_SLOTS[startIndex + i]);
                }
            }

            // SALVAR NO FIREBASE FIRST
            await window.db.collection("agendamentos").add({
                name: name,
                phone: phone,
                service: service, // (Virá como "Corte, Barba")
                date: date,
                time: time,
                timeSlots: timeSlotsToBook,
                notes: notes,
                status: 'pendente', // Novo campo de controle logico
                createdAt: new Date()
            });

            // Format date to Brazilian format
            const [y, m, d] = date.split('-');
            const formattedDate = `${d}/${m}/${y}`;

        // Build WhatsApp message
        let parsedServices = service;
        if(selectedServiceIds.length > 1) {
            parsedServices = selectedServiceIds.join(' + ');
        }
        
        let message = `🔶 *NOVO AGENDAMENTO - ${CONFIG.businessName}* 🔶\n\n`;
        message += `👤 *Nome:* ${name}\n`;
        message += `📱 *Telefone:* ${phone}\n`;
        message += `✂️ *Serviço(s):* ${parsedServices}\n`;
        message += `📅 *Data:* ${formattedDate}\n`;
        message += `🕐 *Horário de Início:* ${time}\n`;
        message += `⏳ *Tempo Reservado:* ${totalDurationMin} minutos\n`;

        if (notes) {
            message += `\n📝 *Observações:* ${notes}\n`;
        }

        message += `\n_Aguardo confirmação!_ 💈`;
        // Encoded message string just in case, but no redirect happens
        const encodedMessage = encodeURIComponent(message);
        
        // Efeito Visual de Sucesso no Botão (Dica do Usuário)
        submitBtn.classList.add('btn-success');
        submitBtn.innerHTML = `<span class="btn-icon"><i data-lucide="check-circle-2"></i></span> CONFIRMADO`;
        if(window.lucide) lucide.createIcons();

        // Show success toast instead of redirect
        showToast('✅ Seu agendamento foi enviado para aprovação!');

        // Reset form and restore button after delay, then scroll page to top (#inicio)
        setTimeout(() => {
            bookingForm.reset();
            
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-success');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.opacity = '1';
            
            // Re-render Lucide icons se aplicavel
            if(window.lucide) lucide.createIcons();
            
            // Re-fetch slots to hide the unselected ones
            dateInput.dispatchEvent(new Event('change'));

            // O redirecionamento pedido pelo usuário p/ topo da página após F5 (Lógica)
            window.location.href = '#inicio';

        }, 2500);

        } catch (error) {
            console.error("Erro ao agendar: ", error);
            showToast('❌ Ocorreu um erro no sistema, tente novamente');
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.opacity = '1';
            if(window.lucide) lucide.createIcons();
        }
    });

    // =====================
    // TOAST NOTIFICATION
    // =====================
    let toastTimeout;

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }

    // =====================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // =====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // =====================
    // PARALLAX HERO (subtle)
    // =====================
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            hero.style.backgroundPositionY = `${scrolled * 0.4}px`;
        }
    });

    // =====================
    // SERVICE CARDS STAGGER ANIMATION
    // =====================
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.08}s`;
    });

    // =====================
    // INITIALIZE LUCIDE ICONS
    // =====================
    if(window.lucide) {
        lucide.createIcons();
    }

    // Log initialization
    console.log(`💈 ${CONFIG.businessName} – Site carregado com sucesso!`);
});
