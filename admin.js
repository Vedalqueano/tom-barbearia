// Modo Compatível Window (firebase.firestore)

document.addEventListener('DOMContentLoaded', () => {

    // =====================
    // LOGIN MOCK
    // =====================
    const loginOverlay = document.getElementById('login-overlay');
    const passInput = document.getElementById('admin-pass');
    const btnLogin = document.getElementById('btn-login');
    const loginError = document.getElementById('login-error');

    function checkLogin() {
        if (passInput.value === 'Tom.2026') {
            loginOverlay.style.display = 'none';
            initDashboard();
        } else {
            loginError.style.display = 'block';
            setTimeout(() => loginError.style.display = 'none', 3000);
        }
    }

    btnLogin.addEventListener('click', checkLogin);
    passInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkLogin();
    });

    // =====================
    // DASHBOARD LOGIC
    // =====================
    const dateFilter = document.getElementById('filter-date');
    const agendaLista = document.getElementById('agenda-lista');
    const statsTotal = document.getElementById('stats-total');

    // Inicializa Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Settar hoje como default no filtro
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateFilter.value = today.toISOString().split('T')[0];

    // Variável para guardar o onSnapshot e podermos desinscrever ao mudar a data
    let unsubscribe = null;

    function initDashboard() {
        listenToAgendamentos();
    }

    dateFilter.addEventListener('change', () => {
        listenToAgendamentos();
    });

    function listenToAgendamentos() {
        const selectedDate = dateFilter.value;
        if (!selectedDate) return;

        // Se já houver um listener rolando para outra data, paramos ele.
        if (unsubscribe) unsubscribe();

        agendaLista.innerHTML = `
            <div class="empty-state">
                <i data-lucide="loader-2" class="lucide-spin"></i>
                <p>Sincronizando agenda...</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();

        // Query Firestore agendamentos da data escolhida
        const q = db.collection("agendamentos").where("date", "==", selectedDate);

        // onSnapshot nos dá atualizações em TEMPO REAL (magia do Firebase)
        unsubscribe = q.onSnapshot((snapshot) => {
            const agendamentos = [];
            snapshot.forEach((docSnap) => {
                agendamentos.push({ id: docSnap.id, ...docSnap.data() });
            });

            // Ordenar por hora
            agendamentos.sort((a, b) => a.time.localeCompare(b.time));

            renderAgenda(agendamentos);
        }, (error) => {
            console.error("Erro no Snapshot: ", error);
            agendaLista.innerHTML = `
                <div class="empty-state" style="color:#e74c3c">
                    <i data-lucide="x-circle"></i>
                    <p>Erro ao conectar no banco de dados.</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        });
    }

    function renderAgenda(agendamentos) {
        statsTotal.textContent = agendamentos.length;
        agendaLista.innerHTML = '';

        if (agendamentos.length === 0) {
            agendaLista.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar-check"></i>
                    <p>Nenhum agendamento para este dia.</p>
                    <p style="font-size:0.8rem; margin-top:8px">Você pode aproveitar para descansar! ☕</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        agendamentos.forEach(ag => {
            const card = document.createElement('div');
            card.className = 'agenda-card';
            
            // Controle de Status e Visual
            const isPending = ag.status === 'pendente';
            const statusBadge = isPending 
                ? `<span class="badge badge-pendente">Aguardando Confirmação</span>`
                : `<span class="badge badge-confirmado">Confirmado</span>`;

            // Botão Condicional (Só mostra Confirmar se estiver Pendente)
            const confirmBtnHTML = isPending 
                ? `<button class="btn-action btn-confirm" data-id="${ag.id}" title="Confirmar Agendamento" data-name="${ag.name}" data-phone="${ag.phone.replace(/\D/g, '')}" data-time="${ag.time}"><i data-lucide="check"></i></button>`
                : '';

            card.innerHTML = `
                <div class="agenda-time">${ag.time}</div>
                <div class="agenda-info">
                    ${statusBadge}
                    <h3>${ag.name}</h3>
                    <p><i data-lucide="smartphone"></i> ${ag.phone}</p>
                    <p><i data-lucide="scissors"></i> ${ag.service}</p>
                    ${ag.notes ? `<p style="color:var(--orange)"><i data-lucide="file-text"></i> ${ag.notes}</p>` : ''}
                </div>
                <div class="agenda-actions">
                    ${confirmBtnHTML}
                    <a href="https://api.whatsapp.com/send?phone=${ag.phone.replace(/\D/g, '')}&text=Ol%C3%A1%20${encodeURIComponent(ag.name.split(' ')[0])},%20falando%20da%20Tom%20Barbearia." target="_blank" class="btn-action btn-whatsapp" title="Conversar no WhatsApp">
                        <i data-lucide="message-circle"></i>
                    </a>
                    <button class="btn-action btn-delete" data-id="${ag.id}" title="Cancelar horário">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            
            agendaLista.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();

        // Add event listeners for delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Tem certeza que deseja cancelar este agendamento? Ele voltará a ficar disponível no site para os clientes.')) {
                    try {
                        await db.collection("agendamentos").doc(id).delete();
                        // O onSnapshot cuidará de atualizar a tela automaticamente.
                    } catch (error) {
                        console.error("Erro ao deletar", error);
                        alert("Não foi possível excluir. Tente novamente.");
                    }
                }
            });
        });

        // Add event listeners for confirm buttons
        document.querySelectorAll('.btn-confirm').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnRef = e.currentTarget;
                const id = btnRef.getAttribute('data-id');
                const clientName = btnRef.getAttribute('data-name').split(' ')[0]; // Pega primeiro nome
                const clientPhone = btnRef.getAttribute('data-phone');
                const clientTime = btnRef.getAttribute('data-time');

                if (confirm('Confirmar este agendamento e avisar o cliente no WhatsApp?')) {
                    try {
                        // 1. Atualizar banco pro status final
                        await db.collection("agendamentos").doc(id).update({
                            status: 'confirmado'
                        });
                        
                        // 2. Montar mensagem de Confirmacao Inteligente
                        const wppMessage = `Olá ${clientName}, tudo bem? Seu agendamento na *Tom Barbearia* para hoje às *${clientTime}* foi *CONFIRMADO*! ✅\n\nTe esperamos lá! 💈`;
                        const whatsappURL = `https://wa.me/${clientPhone}?text=${encodeURIComponent(wppMessage)}`;
                        
                        // 3. Abrir web.whatsapp para despachar a confirmacao
                        window.open(whatsappURL, '_blank');

                    } catch (error) {
                        console.error("Erro ao confirmar", error);
                        alert("Não foi possível confirmar. Tente novamente.");
                    }
                }
            });
        });
    }
});
