/**
 * ============================================================================
 * ROCK PAPER SCISSORS | PRO CHAMPIONSHIP ARENA
 * Complete Game Controller with Solo AI, Professional 2-Player Local Duel,
 * Real-Time Firebase Online Multiplayer, Web Audio Synthesizer,
 * 60fps Particle Canvas, Live In-Game Arena Comms, and Match Series Engine.
 * ============================================================================
 */

(function () {
    'use strict';

    // ========================================================================
    // MOVE DEFINITIONS & ASSETS
    // ========================================================================
    const MOVE_DATA = {
        rock: {
            label: "Rock",
            icon: "🗿",
            image: "image/rock.jpg",
            beats: "scissors",
            verb: "crushes"
        },
        paper: {
            label: "Paper",
            icon: "📄",
            image: "image/paper.jpg",
            beats: "rock",
            verb: "covers"
        },
        scissors: {
            label: "Scissors",
            icon: "✂️",
            image: "image/scissors_2.jpg",
            beats: "paper",
            verb: "cuts"
        }
    };

    // ========================================================================
    // TOAST NOTIFICATIONS
    // ========================================================================
    function showToast(message, duration = 2800) {
        const toast = document.getElementById("toast_notification");
        if (!toast) return;
        toast.textContent = message;
        toast.style.display = "block";
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.display = "none";
        }, duration);
    }

    // ========================================================================
    // PROCEDURAL WEB AUDIO SYNTHESIZER
    // High fidelity, responsive retro-modern sound effects with zero dependencies.
    // ========================================================================
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.enabled = true;

            // Load saved preference
            try {
                const saved = localStorage.getItem("rps_sound_enabled");
                if (saved !== null) {
                    this.enabled = saved === "true";
                }
            } catch (e) { }
        }

        initContext() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === "suspended") {
                this.ctx.resume();
            }
        }

        toggle() {
            this.enabled = !this.enabled;
            try {
                localStorage.setItem("rps_sound_enabled", this.enabled.toString());
            } catch (e) { }
            return this.enabled;
        }

        playTone(freq, type, duration, gainStart = 0.15, gainEnd = 0.001) {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.ctx) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) { }
        }

        playClick() {
            this.playTone(520, "sine", 0.08, 0.1, 0.001);
        }

        playLock() {
            if (!this.enabled) return;
            this.playTone(340, "triangle", 0.06, 0.15, 0.01);
            setTimeout(() => {
                this.playTone(680, "sine", 0.1, 0.15, 0.001);
            }, 60);
        }

        playClash() {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.ctx) return;

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(140, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.28);

                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.3);
            } catch (e) { }
        }

        playWin() {
            if (!this.enabled) return;
            const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, "triangle", 0.22, 0.15, 0.001);
                }, idx * 75);
            });
        }

        playLose() {
            if (!this.enabled) return;
            const notes = [400, 360, 310, 260];
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, "sine", 0.2, 0.12, 0.001);
                }, idx * 80);
            });
        }

        playDraw() {
            if (!this.enabled) return;
            this.playTone(480, "sine", 0.14, 0.12, 0.001);
            setTimeout(() => {
                this.playTone(480, "sine", 0.18, 0.12, 0.001);
            }, 120);
        }

        playFanfare() {
            if (!this.enabled) return;
            const fanfare = [
                { f: 523.25, d: 100 },
                { f: 659.25, d: 100 },
                { f: 783.99, d: 100 },
                { f: 1046.50, d: 350 }
            ];
            fanfare.forEach((n, idx) => {
                setTimeout(() => {
                    this.playTone(n.f, "triangle", n.d / 1000 + 0.1, 0.2, 0.001);
                }, idx * 120);
            });
        }

        playMessage() {
            if (!this.enabled) return;
            this.playTone(620, "sine", 0.07, 0.1, 0.001);
            setTimeout(() => {
                this.playTone(880, "sine", 0.1, 0.1, 0.001);
            }, 60);
        }
    }

    // ========================================================================
    // 60FPS PARTICLE & CONFETTI CANVAS ENGINE
    // ========================================================================
    class FXEngine {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
            this.particles = [];
            this.animating = false;

            if (this.canvas) {
                this.resize();
                window.addEventListener("resize", () => this.resize());
            }
        }

        resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        burstSparks(x, y, count = 25) {
            if (!this.ctx) return;
            const colors = ["#5ce1e6", "#a78bfa", "#fbbf24", "#ffffff"];
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 7;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 2 + Math.random() * 3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: 0.02 + Math.random() * 0.02,
                    type: "spark"
                });
            }
            this.startLoop();
        }

        blastConfetti(count = 90) {
            if (!this.ctx) return;
            const colors = ["#5ce1e6", "#a78bfa", "#50e3a4", "#fbbf24", "#ff7188"];
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -20 - Math.random() * 50,
                    vx: (Math.random() - 0.5) * 4,
                    vy: 3 + Math.random() * 5,
                    size: 6 + Math.random() * 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: 0.006 + Math.random() * 0.005,
                    rotation: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 10,
                    type: "confetti"
                });
            }
            this.startLoop();
        }

        startLoop() {
            if (!this.animating) {
                this.animating = true;
                requestAnimationFrame(() => this.update());
            }
        }

        update() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.type === "confetti") {
                    p.rotation += p.rotSpeed;
                    p.vy += 0.05; // slight gravity
                }

                if (p.alpha <= 0 || p.y > this.canvas.height + 20) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, p.alpha);
                this.ctx.fillStyle = p.color;

                if (p.type === "confetti") {
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate((p.rotation * Math.PI) / 180);
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                this.ctx.restore();
            }

            if (this.particles.length > 0) {
                requestAnimationFrame(() => this.update());
            } else {
                this.animating = false;
            }
        }
    }

    // ========================================================================
    // GAME STATE & CONTROLLER
    // ========================================================================
    const state = {
        mode: "cpu", // "cpu", "pvp", or "online"
        seriesTarget: 3, // 3, 5, or 0 (endless)
        roundNumber: 1,
        scores: {
            p1: 0,
            p2: 0,
            draws: 0
        },
        streak: 0,
        isResolving: false,
        pvp: {
            p1Choice: null,
            p2Choice: null
        },
        online: {
            roomId: null,
            role: null, // "host" (p1) or "guest" (p2)
            playerId: null,
            playerName: "Commander",
            opponentName: "Waiting...",
            connected: false,
            connectionState: "unconfigured", // "unconfigured", "connecting", "connected", "reconnecting", "timeout", "error"
            opponentConnected: false,
            myLocked: false,
            myChoice: null,
            roomData: null,
            unreadChat: 0,
            chatMinimized: false
        },
        history: []
    };

    // Helper: Promise timeout wrapper to prevent hanging operations
    function withTimeout(promise, ms = 8000, timeoutErrorMsg = "Operation timed out") {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutErrorMsg)), ms))
        ]);
    }

    // DOM Elements Cache
    const elements = {
        // Mode tabs
        tabCpu: document.getElementById("tab_cpu"),
        tabPvp: document.getElementById("tab_pvp"),
        tabOnline: document.getElementById("tab_online"),

        // Utility actions
        soundBtn: document.getElementById("sound_toggle_btn"),
        soundIcon: document.getElementById("sound_icon"),
        chatToggleBtn: document.getElementById("chat_toggle_btn"),
        chatUnreadBadge: document.getElementById("chat_unread_badge"),
        cloudSetupBtn: document.getElementById("cloud_setup_btn"),
        cloudStatusDot: document.getElementById("cloud_status_dot"),
        controlsBtn: document.getElementById("controls_modal_btn"),

        // Sections
        seriesBar: document.getElementById("series_bar"),
        seriesButtons: document.querySelectorAll(".series-btn"),
        streakTracker: document.getElementById("streak_tracker"),
        streakValue: document.getElementById("streak_value"),
        heroSection: document.getElementById("hero_section"),
        heroEyebrow: document.getElementById("hero_eyebrow"),
        heroTitle: document.getElementById("hero_title"),
        heroSubtitle: document.getElementById("hero_subtitle"),

        // Arena & Fighters
        arena: document.getElementById("arena"),
        roundBadge: document.getElementById("round_badge"),
        versusBadge: document.getElementById("versus_badge"),
        matchPointTag: document.getElementById("match_point_tag"),
        fighterP1: document.getElementById("fighter_p1"),
        fighterP2: document.getElementById("fighter_p2"),
        p1NameDisplay: document.getElementById("p1_name_display"),
        p2NameDisplay: document.getElementById("p2_name_display"),
        p1Pips: document.getElementById("p1_pips"),
        p2Pips: document.getElementById("p2_pips"),
        userMove: document.getElementById("user_move"),
        compMove: document.getElementById("comp_move"),
        userCaption: document.getElementById("user_caption"),
        compCaption: document.getElementById("comp_caption"),
        p2Dot: document.getElementById("p2_dot"),

        // Scoreboard
        scoreboardSection: document.getElementById("scoreboard_section"),
        p1Score: document.getElementById("you_score"),
        p2Score: document.getElementById("comp_score"),
        drawScore: document.getElementById("draw_score"),
        p1ScoreLabel: document.getElementById("score_label_p1"),
        p2ScoreLabel: document.getElementById("score_label_p2"),
        p2ScoreIcon: document.getElementById("score_icon_p2"),

        // Solo Controls
        soloControls: document.getElementById("solo_controls"),
        choiceButtons: document.querySelectorAll(".choice"),

        // Local PvP Controls
        pvpControls: document.getElementById("pvp_controls"),
        p1StatusBadge: document.getElementById("p1_status_badge"),
        p2StatusBadge: document.getElementById("p2_status_badge"),
        pvpChoiceButtons: document.querySelectorAll(".pvp-choice-btn"),

        // Online Lobby & Hub
        onlineLobby: document.getElementById("online_lobby"),
        lobbyConfigAlert: document.getElementById("lobby_config_alert"),
        lobbyConfigAlertBtn: document.getElementById("lobby_config_alert_btn"),
        playerNameInput: document.getElementById("player_name_input"),
        lobbySeriesChips: document.querySelectorAll(".lobby-series-chip"),
        createRoomBtn: document.getElementById("create_room_btn"),
        joinRoomInput: document.getElementById("join_room_input"),
        joinRoomBtn: document.getElementById("join_room_btn"),
        cloudStatusPill: document.getElementById("cloud_status_pill"),
        cloudIndicatorDot: document.getElementById("cloud_indicator_dot"),
        cloudStatusText: document.getElementById("cloud_status_text"),
        cloudModalLink: document.getElementById("cloud_modal_link"),

        onlineRoomHub: document.getElementById("online_room_hub"),
        hubRoomCode: document.getElementById("hub_room_code"),
        hubCopyCodeBtn: document.getElementById("hub_copy_code_btn"),
        hubConnectionStatus: document.getElementById("hub_connection_status"),
        hubStatusDot: document.getElementById("hub_status_dot"),
        hubStatusText: document.getElementById("hub_status_text"),
        hubLeaveBtn: document.getElementById("hub_leave_btn"),
        hubShareUrlInput: document.getElementById("hub_share_url_input"),
        hubCopyUrlBtn: document.getElementById("hub_copy_url_btn"),
        hubShareUrlBtn: document.getElementById("hub_share_url_btn"),
        hubWaitingBox: document.getElementById("hub_waiting_box"),
        hubNetworkBadge: document.getElementById("hub_network_badge"),
        hubNetworkDesc: document.getElementById("hub_network_desc"),
        hubLocalTabBtn: document.getElementById("hub_local_tab_btn"),

        // Online Weapon Dock
        onlineControls: document.getElementById("online_controls"),
        onlineChoiceButtons: document.querySelectorAll(".online-choice"),
        onlineLockStatusText: document.getElementById("online_lock_status_text"),

        // Results
        resultPanel: document.getElementById("result_panel"),
        resultSymbol: document.getElementById("result_symbol"),
        resultKicker: document.getElementById("result_kicker"),
        msg: document.getElementById("msg"),
        resultDetail: document.getElementById("result_detail"),
        resetBtn: document.getElementById("reset_btn"),

        // Combat History
        historyList: document.getElementById("history_list"),
        historyCount: document.getElementById("history_count"),

        // Arena Comms Chat
        arenaChatPanel: document.getElementById("arena_chat_panel"),
        chatMinimizeBtn: document.getElementById("chat_minimize_btn"),
        chatMessages: document.getElementById("chat_messages"),
        chatForm: document.getElementById("chat_form"),
        chatInput: document.getElementById("chat_input"),
        chatReactionChips: document.querySelectorAll(".reaction-chip"),

        // Modals
        champModal: document.getElementById("champ_modal"),
        champWinnerName: document.getElementById("champ_winner_name"),
        champScoreSummary: document.getElementById("champ_score_summary"),
        champMessage: document.getElementById("champ_message"),
        champRematchBtn: document.getElementById("champ_rematch_btn"),

        controlsModal: document.getElementById("controls_modal"),
        modalCloseBtn: document.getElementById("modal_close_btn"),
        modalOkBtn: document.getElementById("modal_ok_btn"),

        cloudModal: document.getElementById("cloud_modal"),
        cloudModalCloseBtn: document.getElementById("cloud_modal_close_btn"),
        cloudModalStatusDot: document.getElementById("cloud_modal_status_dot"),
        cloudModalStatusText: document.getElementById("cloud_modal_status_text"),
        firebaseConfigTextarea: document.getElementById("firebase_config_textarea"),
        customHostingDomainInput: document.getElementById("custom_hosting_domain_input"),
        cloudSaveBtn: document.getElementById("cloud_save_btn"),
        cloudResetBtn: document.getElementById("cloud_reset_btn")
    };

    // Instantiate Subsystems
    const sound = new SoundEngine();
    const fx = new FXEngine("fx_canvas");

    // Initialize UI Sound Button state
    function updateSoundButton() {
        if (elements.soundIcon) {
            elements.soundIcon.textContent = sound.enabled ? "🔊" : "🔇";
        }
        if (elements.soundBtn) {
            elements.soundBtn.setAttribute("title", sound.enabled ? "Sound ON (Press M)" : "Sound MUTED (Press M)");
        }
    }
    updateSoundButton();

    // ========================================================================
    // AI LOGIC (SOLO MODE)
    // ========================================================================
    function generateCpuChoice() {
        const moves = Object.keys(MOVE_DATA);

        // Pattern reactivity: occasionally counter player's previous move
        if (state.history.length > 0 && Math.random() < 0.35) {
            const lastRound = state.history[0];
            const playerLastMove = lastRound.p1Move;
            for (const key of moves) {
                if (MOVE_DATA[key].beats === playerLastMove) {
                    return key;
                }
            }
        }

        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
    }

    // ========================================================================
    // WINNER CALCULATION
    // ========================================================================
    function evaluateRound(choice1, choice2) {
        if (choice1 === choice2) return "draw";
        if (MOVE_DATA[choice1].beats === choice2) return "p1";
        return "p2";
    }

    // ========================================================================
    // DISPLAY & ANIMATIONS
    // ========================================================================
    function renderMove(target, moveKey, isSecret = false, isP2 = false) {
        target.classList.remove("reveal", "reveal-p2", "locked");

        if (isSecret) {
            target.innerHTML = `<span class="move-placeholder">🔒</span>`;
            target.classList.add("locked");
            return;
        }

        if (!moveKey || !MOVE_DATA[moveKey]) {
            target.innerHTML = `<span class="move-placeholder">?</span>`;
            return;
        }

        const data = MOVE_DATA[moveKey];
        target.innerHTML = `
            <img src="${data.image}" alt="${data.label}">
        `;

        void target.offsetWidth; // Trigger reflow for animation restart
        target.classList.add(isP2 ? "reveal-p2" : "reveal");
    }

    function updateSeriesPips() {
        if (!elements.p1Pips || !elements.p2Pips) return;

        elements.p1Pips.innerHTML = "";
        elements.p2Pips.innerHTML = "";

        if (state.seriesTarget === 0) {
            elements.matchPointTag.style.display = "none";
            return;
        }

        for (let i = 0; i < state.seriesTarget; i++) {
            const p1Pip = document.createElement("span");
            p1Pip.className = "pip" + (i < state.scores.p1 ? " filled-p1" : "");
            elements.p1Pips.appendChild(p1Pip);

            const p2Pip = document.createElement("span");
            p2Pip.className = "pip" + (i < state.scores.p2 ? " filled-p2" : "");
            elements.p2Pips.appendChild(p2Pip);
        }

        // Check for Match Point
        const p1MatchPoint = state.scores.p1 === state.seriesTarget - 1;
        const p2MatchPoint = state.scores.p2 === state.seriesTarget - 1;

        if (p1MatchPoint || p2MatchPoint) {
            elements.matchPointTag.style.display = "inline-block";
            elements.matchPointTag.textContent = (p1MatchPoint && p2MatchPoint) ? "DOUBLE MATCH POINT" : "MATCH POINT";
        } else {
            elements.matchPointTag.style.display = "none";
        }
    }

    function renderScoreboard() {
        elements.p1Score.textContent = state.scores.p1;
        elements.p2Score.textContent = state.scores.p2;
        elements.drawScore.textContent = state.scores.draws;

        elements.roundBadge.textContent = `ROUND ${state.roundNumber}`;
        elements.streakValue.textContent = state.streak;

        updateSeriesPips();
    }

    function updateResultPanel(type, kicker, message, detail, symbol) {
        elements.resultPanel.classList.remove("win", "lose", "draw");
        elements.resultPanel.classList.add(type);

        elements.resultKicker.textContent = kicker;
        elements.msg.textContent = message;
        elements.resultDetail.textContent = detail;
        elements.resultSymbol.textContent = symbol;
    }

    function addHistoryEntry(roundNum, p1Move, p2Move, result, summary) {
        const entry = {
            round: roundNum,
            p1Move,
            p2Move,
            result,
            summary
        };
        state.history.unshift(entry);

        if (elements.historyList) {
            const emptyNotice = elements.historyList.querySelector(".history-empty");
            if (emptyNotice) {
                emptyNotice.remove();
            }

            const pill = document.createElement("div");
            pill.className = `history-pill ${result}`;
            const p1Icon = MOVE_DATA[p1Move].icon;
            const p2Icon = MOVE_DATA[p2Move].icon;

            let outcomeText = "DRAW";
            if (result === "win") {
                outcomeText = state.mode === "cpu" ? "YOU WON" : (state.mode === "online" ? "HOST WON" : "P1 WON");
            }
            if (result === "lose") {
                outcomeText = state.mode === "cpu" ? "CPU WON" : (state.mode === "online" ? "GUEST WON" : "P2 WON");
            }

            pill.innerHTML = `
                <span class="history-round">R${roundNum}</span>
                <span>${p1Icon} vs ${p2Icon}</span>
                <span class="history-outcome">&bull; ${outcomeText}</span>
            `;

            elements.historyList.insertBefore(pill, elements.historyList.firstChild);

            // Keep max 10 entries in DOM
            while (elements.historyList.children.length > 10) {
                elements.historyList.removeChild(elements.historyList.lastChild);
            }
        }

        if (elements.historyCount) {
            elements.historyCount.textContent = `${state.history.length} ROUND${state.history.length === 1 ? "" : "S"} PLAYED`;
        }
    }

    function triggerChampionship(winnerName, winnerScore, loserScore) {
        sound.playFanfare();
        fx.blastConfetti(120);

        elements.champWinnerName.textContent = `${winnerName} WINS!`;
        elements.champScoreSummary.textContent = `Series Score: ${winnerScore} - ${loserScore}`;
        elements.champMessage.textContent = `${winnerName} claims championship supremacy in the Battle Arena!`;
        elements.champModal.style.display = "grid";
    }

    function checkSeriesWinner() {
        if (state.seriesTarget === 0) return false;

        let p1Name = "PLAYER 1";
        let p2Name = "PLAYER 2";

        if (state.mode === "cpu") {
            p1Name = "YOU";
            p2Name = "COMPUTER";
        } else if (state.mode === "online") {
            p1Name = state.online.role === "host" ? (state.online.playerName + " (YOU)") : (state.online.opponentName || "HOST");
            p2Name = state.online.role === "guest" ? (state.online.playerName + " (YOU)") : (state.online.opponentName || "GUEST");
        }

        if (state.scores.p1 >= state.seriesTarget) {
            triggerChampionship(p1Name, state.scores.p1, state.scores.p2);
            return true;
        } else if (state.scores.p2 >= state.seriesTarget) {
            triggerChampionship(p2Name, state.scores.p2, state.scores.p1);
            return true;
        }

        return false;
    }

    // ========================================================================
    // ROUND RESOLUTION WITH SYNCHRONIZED CLASH ANIMATION
    // ========================================================================
    function executeClash(p1Choice, p2Choice, callbackAfterReveal) {
        state.isResolving = true;

        // Arena clash shake animation
        elements.arena.classList.add("clashing");
        sound.playClash();

        // Burst sparks in the center
        const rect = elements.versusBadge.getBoundingClientRect();
        fx.burstSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);

        setTimeout(() => {
            elements.arena.classList.remove("clashing");

            // Reveal both moves simultaneously
            renderMove(elements.userMove, p1Choice, false, false);
            renderMove(elements.compMove, p2Choice, false, true);

            // Update captions
            const p1Label = MOVE_DATA[p1Choice].label;
            const p2Label = MOVE_DATA[p2Choice].label;

            let fighter1Title = state.mode === "cpu" ? "You" : "Player 1";
            let fighter2Title = state.mode === "cpu" ? "CPU" : "Player 2";

            if (state.mode === "online") {
                fighter1Title = state.online.role === "host" ? state.online.playerName : state.online.opponentName;
                fighter2Title = state.online.role === "guest" ? state.online.playerName : state.online.opponentName;
            }

            elements.userCaption.textContent = `${fighter1Title} picked ${p1Label}`;
            elements.compCaption.textContent = `${fighter2Title} picked ${p2Label}`;

            // Evaluate Outcome
            const outcome = evaluateRound(p1Choice, p2Choice);

            if (outcome === "draw") {
                state.scores.draws++;
                sound.playDraw();
                updateResultPanel(
                    "draw",
                    "ROUND DRAW",
                    "It's an equal standoff!",
                    `Both fighters locked in ${p1Label}. Prepare for the next round!`,
                    "＝"
                );
                addHistoryEntry(state.roundNumber, p1Choice, p2Choice, "draw", "Equal standoff");
            } else if (outcome === "p1") {
                state.scores.p1++;
                state.streak++;
                sound.playWin();
                fx.blastConfetti(45);

                const verb = MOVE_DATA[p1Choice].verb;
                let winTitle = `${fighter1Title} takes the round!`;
                if (state.mode === "cpu") winTitle = "You won this round!";
                else if (state.mode === "online" && state.online.role === "host") winTitle = "You won this round!";

                const winDetail = `${p1Label} ${verb} ${p2Label}. Brilliant timing!`;
                updateResultPanel("win", "ROUND WON", winTitle, winDetail, "✦");
                addHistoryEntry(state.roundNumber, p1Choice, p2Choice, "win", `${p1Label} beats ${p2Label}`);
            } else {
                state.scores.p2++;
                state.streak = 0;
                sound.playLose();

                const verb = MOVE_DATA[p2Choice].verb;
                let loseTitle = `${fighter2Title} takes the round!`;
                if (state.mode === "cpu") loseTitle = "CPU takes this round";
                else if (state.mode === "online" && state.online.role === "guest") loseTitle = "You won this round!";

                const loseDetail = `${p2Label} ${verb} ${p1Label}. Prepare your counter-strategy!`;
                updateResultPanel("lose", "ROUND LOST", loseTitle, loseDetail, "↗");
                addHistoryEntry(state.roundNumber, p1Choice, p2Choice, "lose", `${p2Label} beats ${p1Choice}`);
            }

            state.roundNumber++;
            renderScoreboard();

            // Check if tournament match won
            const matchEnded = checkSeriesWinner();

            // Local 2-Player duel readiness reset
            if (state.mode === "pvp" && !matchEnded) {
                setTimeout(() => {
                    resetPvpReadiness();
                }, 800);
            }

            state.isResolving = false;

            if (typeof callbackAfterReveal === "function") {
                callbackAfterReveal(outcome, matchEnded);
            }
        }, 360);
    }

    // ========================================================================
    // SOLO MODE CONTROLLER
    // ========================================================================
    function playSoloGame(choice) {
        if (state.isResolving) return;

        sound.playClick();

        elements.choiceButtons.forEach(btn => {
            btn.classList.toggle("selected", btn.dataset.move === choice);
        });

        const cpuChoice = generateCpuChoice();
        executeClash(choice, cpuChoice);
    }

    // ========================================================================
    // 2-PLAYER LOCAL DUEL CONTROLLER
    // ========================================================================
    function handlePvpPick(playerNum, move) {
        if (state.isResolving) return;

        if (playerNum === 1) {
            state.pvp.p1Choice = move;
            sound.playLock();
            elements.p1StatusBadge.textContent = "LOCKED IN 🔒";
            elements.p1StatusBadge.classList.add("locked");
            renderMove(elements.userMove, move, true, false);
            elements.userCaption.textContent = "Player 1 is locked in";

            document.querySelectorAll(".pvp-p1-dock .pvp-choice-btn").forEach(btn => {
                btn.classList.toggle("selected", btn.dataset.move === move);
            });
        } else if (playerNum === 2) {
            state.pvp.p2Choice = move;
            sound.playLock();
            elements.p2StatusBadge.textContent = "LOCKED IN 🔒";
            elements.p2StatusBadge.classList.add("locked");
            renderMove(elements.compMove, move, true, true);
            elements.compCaption.textContent = "Player 2 is locked in";

            document.querySelectorAll(".pvp-p2-dock .pvp-choice-btn").forEach(btn => {
                btn.classList.toggle("selected", btn.dataset.move === move);
            });
        }

        // When both players have picked secretly
        if (state.pvp.p1Choice && state.pvp.p2Choice) {
            executeClash(state.pvp.p1Choice, state.pvp.p2Choice);
        }
    }

    function resetPvpReadiness() {
        state.pvp.p1Choice = null;
        state.pvp.p2Choice = null;

        elements.p1StatusBadge.textContent = "WAITING";
        elements.p1StatusBadge.classList.remove("locked");

        elements.p2StatusBadge.textContent = "WAITING";
        elements.p2StatusBadge.classList.remove("locked");

        document.querySelectorAll(".pvp-choice-btn").forEach(btn => {
            btn.classList.remove("selected");
        });

        renderMove(elements.userMove, null);
        renderMove(elements.compMove, null);

        elements.userCaption.textContent = "Awaiting Player 1 pick";
        elements.compCaption.textContent = "Awaiting Player 2 pick";
    }

    // ========================================================================
    // REAL-TIME ONLINE MULTIPLAYER MANAGER (FIREBASE)
    // ========================================================================
    class OnlineMultiplayerManager {
        constructor() {
            this.db = null;
            this.roomRef = null;
            this.chatRef = null;
            this.listeners = [];
            this.isHost = false;
            this.selectedLobbySeries = 3;
            this.hasInitialSync = false;
            this.connectionTimeoutTimer = null;
            this.connectedListenerRef = null;

            // Generate or load unique player ID and name
            this.initPlayerIdentity();
            this.initFirebase();
        }

        initPlayerIdentity() {
            let pid = localStorage.getItem("rps_online_player_id");
            if (!pid) {
                pid = "p_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
                localStorage.setItem("rps_online_player_id", pid);
            }
            state.online.playerId = pid;

            let pname = localStorage.getItem("rps_online_player_name") || "Commander";
            state.online.playerName = pname;
            if (elements.playerNameInput) {
                elements.playerNameInput.value = pname;
            }
        }

        async initFirebase() {
            if (typeof firebase === "undefined") {
                console.warn("Firebase SDK not loaded yet.");
                this.setConnectionState("error", "Firebase SDK not loaded");
                return;
            }

            // Cleanly detach any previous connection listener
            if (this.connectedListenerRef) {
                try {
                    this.connectedListenerRef.off();
                } catch (e) { }
                this.connectedListenerRef = null;
            }
            clearTimeout(this.connectionTimeoutTimer);

            const config = (typeof getActiveFirebaseConfig === "function") ? getActiveFirebaseConfig() : null;
            const isConfigured = (typeof isFirebaseConfigured === "function") ? isFirebaseConfigured(config) : false;

            // If Firebase is not yet configured with real project credentials
            if (!isConfigured) {
                this.db = null;
                state.online.connected = false;
                this.setConnectionState("unconfigured", "⚙️ Firebase Setup Required");
                return;
            }

            try {
                // Reuse existing initialized app if present, or initialize cleanly
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                }

                // If Firebase Auth is available, perform anonymous authentication
                if (firebase.auth) {
                    try {
                        const auth = firebase.auth();
                        if (!auth.currentUser) {
                            await auth.signInAnonymously();
                        }
                    } catch (authErr) {
                        console.warn("Firebase Auth anonymous notice:", authErr.message);
                    }
                }

                this.db = firebase.database();

                this.setConnectionState("connecting", "Connecting to Realtime Cloud...");

                let connectedOnce = false;

                // Watchdog timer: detect if connection hangs due to an invalid database URL or network firewall
                this.connectionTimeoutTimer = setTimeout(() => {
                    if (!connectedOnce && state.online.connectionState === "connecting") {
                        this.setConnectionState("timeout", "⚠️ Connection Timeout (Check URL & Rules)");
                    }
                }, 7500);

                this.connectedListenerRef = this.db.ref(".info/connected");
                this.connectedListenerRef.on("value", snap => {
                    const isOnline = snap.val() === true;
                    if (isOnline) {
                        connectedOnce = true;
                        clearTimeout(this.connectionTimeoutTimer);
                        state.online.connected = true;
                        this.setConnectionState("connected", "🟢 Realtime Cloud Connected");
                    } else if (connectedOnce) {
                        state.online.connected = false;
                        this.setConnectionState("reconnecting", "⚠️ Connection Lost (Reconnecting...)");
                    } else {
                        state.online.connected = false;
                        this.setConnectionState("connecting", "Connecting to Realtime Cloud...");
                    }
                });
            } catch (err) {
                console.error("Firebase initialization error:", err);
                this.setConnectionState("error", `❌ Config Error: ${err.message}`);
            }
        }

        setConnectionState(status, message) {
            state.online.connectionState = status;

            // Topbar dot
            if (elements.cloudStatusDot) {
                elements.cloudStatusDot.className = "cloud-status-dot " + status;
            }

            // Lobby indicator dot & status text
            if (elements.cloudIndicatorDot) {
                elements.cloudIndicatorDot.className = "cloud-status-indicator " + status;
            }
            if (elements.cloudStatusText) {
                elements.cloudStatusText.textContent = message;
            }

            // Modal status pill
            if (elements.cloudModalStatusDot) {
                elements.cloudModalStatusDot.className = "cloud-status-indicator " + status;
            }
            if (elements.cloudModalStatusText) {
                elements.cloudModalStatusText.textContent = message;
            }

            // Show or hide setup required alert in the lobby
            if (elements.lobbyConfigAlert) {
                if (status === "unconfigured") {
                    elements.lobbyConfigAlert.style.display = "flex";
                } else if (status === "timeout" || status === "error") {
                    elements.lobbyConfigAlert.style.display = "flex";
                    const alertText = elements.lobbyConfigAlert.querySelector("div");
                    if (alertText) {
                        alertText.innerHTML = `<strong>Database Unreachable:</strong> ${message}. Check your databaseURL and Realtime Database rules.`;
                    }
                } else {
                    elements.lobbyConfigAlert.style.display = "none";
                }
            }
        }

        generateRoomCode() {
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            let code = "RPS-";
            for (let i = 0; i < 4; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }

        getShareableLink(roomCode) {
            // 1. If user configured a custom deployed URL override (e.g. Vercel deployment link)
            const custom = (typeof getCustomHostingUrl === "function") ? getCustomHostingUrl() : null;
            if (custom) {
                const clean = custom.replace(/\/+$/, "");
                const separator = clean.endsWith(".html") ? "?" : "/?";
                return `${clean}${separator}room=${encodeURIComponent(roomCode)}`;
            }

            // 2. Derive base from window.location
            const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
            let path = window.location.pathname || "/";
            if (path.endsWith("index.html")) {
                path = path.slice(0, -10);
            }
            const cleanBase = `${origin}${path}`.replace(/\/+$/, "");
            const separator = cleanBase.endsWith(".html") ? "?" : "/?";
            return `${cleanBase}${separator}room=${encodeURIComponent(roomCode)}`;
        }

        detachRoomListeners() {
            if (this.listeners && this.listeners.length > 0) {
                this.listeners.forEach(item => {
                    try {
                        item.ref.off(item.event, item.fn);
                    } catch (e) { }
                });
                this.listeners = [];
            }
        }

        async createRoom() {
            const config = (typeof getActiveFirebaseConfig === "function") ? getActiveFirebaseConfig() : null;
            const isConfigured = (typeof isFirebaseConfigured === "function") ? isFirebaseConfigured(config) : false;

            if (!isConfigured) {
                showToast("Please configure your Firebase Database in Cloud Settings first ⚙️");
                openCloudModal();
                return;
            }

            if (!this.db) {
                await this.initFirebase();
                if (!this.db) {
                    showToast("Database not initialized. Please check Cloud Settings ⚙️");
                    openCloudModal();
                    return;
                }
            }

            // Save player name
            this.updatePlayerNameFromInput();

            const roomCode = this.generateRoomCode();
            const targetRef = this.db.ref("rooms/" + roomCode);

            const roomData = {
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                hostId: state.online.playerId,
                hostName: state.online.playerName,
                guestId: null,
                guestName: null,
                seriesTarget: this.selectedLobbySeries,
                round: 1,
                scores: { p1: 0, p2: 0, draws: 0 },
                status: "waiting", // "waiting", "playing", "revealing", "round_over", "match_over"
                p1Locked: false,
                p2Locked: false,
                p1Choice: null,
                p2Choice: null,
                p1Connected: true,
                p2Connected: false,
                winner: null
            };

            showToast("Connecting to room in Realtime Cloud...");

            try {
                await withTimeout(
                    targetRef.set(roomData),
                    8000,
                    "Database connection timed out. Check your databaseURL and network."
                );

                // Set onDisconnect for host presence
                targetRef.child("p1Connected").onDisconnect().set(false);

                // Save session for seamless refresh recovery
                sessionStorage.setItem("rps_session_room", roomCode);
                sessionStorage.setItem("rps_session_role", "host");

                // Only commit active room state AFTER Firebase write succeeds:
                this.roomRef = targetRef;
                state.online.roomId = roomCode;
                state.online.role = "host";
                this.isHost = true;
                state.seriesTarget = this.selectedLobbySeries;

                this.detachRoomListeners();
                this.attachRoomListeners();
                this.setupChat();
                this.enterActiveRoomUI();
                showToast("Battle room created! Share link with challenger ⚔️");
            } catch (err) {
                console.error("Room creation failed:", err);
                this.roomRef = null;
                state.online.roomId = null;
                state.online.role = null;
                this.isHost = false;

                if (err.code === "PERMISSION_DENIED" || (err.message && err.message.toLowerCase().includes("permission_denied"))) {
                    alert("Firebase Permission Denied!\n\nIn Firebase Console -> Realtime Database -> Rules tab, check your read and write permissions.");
                    showToast("Permission denied: Check Realtime Database rules in Firebase Console ❌", 4500);
                } else {
                    showToast(`Room creation error: ${err.message || "Failed to reach database"} ❌`, 4500);
                }
            }
        }

        async joinRoom(roomCode) {
            const config = (typeof getActiveFirebaseConfig === "function") ? getActiveFirebaseConfig() : null;
            const isConfigured = (typeof isFirebaseConfigured === "function") ? isFirebaseConfigured(config) : false;

            if (!isConfigured) {
                showToast("Please configure your Firebase Database in Cloud Settings first ⚙️");
                openCloudModal();
                return;
            }

            if (!this.db) {
                await this.initFirebase();
                if (!this.db) {
                    showToast("Database not initialized. Please check Cloud Settings ⚙️");
                    openCloudModal();
                    return;
                }
            }

            const cleanCode = (roomCode || "").trim().toUpperCase();
            if (!cleanCode || cleanCode.length < 3) {
                showToast("Please enter a valid room code!");
                return;
            }

            this.updatePlayerNameFromInput();
            showToast(`Searching for room ${cleanCode}...`);

            const targetRef = this.db.ref("rooms/" + cleanCode);

            try {
                const snap = await withTimeout(
                    targetRef.once("value"),
                    8000,
                    "Database connection timed out. Check your databaseURL and network."
                );

                if (!snap.exists()) {
                    showToast("Room " + cleanCode + " not found or expired ❌");
                    return;
                }

                const data = snap.val();

                // Check capacity & roles
                if (data.hostId === state.online.playerId) {
                    // Rejoining as host
                    state.online.roomId = cleanCode;
                    state.online.role = "host";
                    this.isHost = true;
                    await targetRef.child("p1Connected").set(true);
                    targetRef.child("p1Connected").onDisconnect().set(false);
                } else if (!data.guestId || data.guestId === state.online.playerId) {
                    // Joining as guest
                    state.online.roomId = cleanCode;
                    state.online.role = "guest";
                    this.isHost = false;

                    await targetRef.update({
                        guestId: state.online.playerId,
                        guestName: state.online.playerName,
                        p2Connected: true,
                        status: "playing"
                    });
                    targetRef.child("p2Connected").onDisconnect().set(false);
                } else if (data.p2Connected && data.guestId !== state.online.playerId) {
                    showToast("Room is full (2/2 players already connected) 🚫");
                    return;
                } else {
                    // Seat open due to disconnect
                    state.online.roomId = cleanCode;
                    state.online.role = "guest";
                    this.isHost = false;

                    await targetRef.update({
                        guestId: state.online.playerId,
                        guestName: state.online.playerName,
                        p2Connected: true,
                        status: "playing"
                    });
                    targetRef.child("p2Connected").onDisconnect().set(false);
                }

                sessionStorage.setItem("rps_session_room", cleanCode);
                sessionStorage.setItem("rps_session_role", state.online.role);

                this.roomRef = targetRef;
                this.detachRoomListeners();
                this.attachRoomListeners();
                this.setupChat();
                this.enterActiveRoomUI();
                showToast("Connected to arena! Battle ready 🔥");
            } catch (err) {
                console.error("Join room error:", err);
                if (err.code === "PERMISSION_DENIED" || (err.message && err.message.toLowerCase().includes("permission_denied"))) {
                    alert("Firebase Permission Denied!\n\nIn Firebase Console -> Realtime Database -> Rules tab, change rules to:\n{\n  \"rules\": {\n    \".read\": true,\n    \".write\": true\n  }\n}");
                    showToast("Permission denied: Check Realtime Database rules in Firebase Console ❌", 4500);
                } else {
                    showToast(`Join error: ${err.message || "Failed to reach database"} ❌`, 4500);
                }
            }
        }

        updatePlayerNameFromInput() {
            if (elements.playerNameInput) {
                const name = elements.playerNameInput.value.trim() || "Commander";
                state.online.playerName = name;
                localStorage.setItem("rps_online_player_name", name);
            }
        }

        enterActiveRoomUI() {
            elements.onlineLobby.style.display = "none";
            elements.onlineRoomHub.style.display = "block";
            elements.onlineControls.style.display = "block";
            elements.arenaChatPanel.style.display = "block";
            elements.chatToggleBtn.style.display = "flex";

            elements.hubRoomCode.textContent = state.online.roomId;
            const shareUrl = this.getShareableLink(state.online.roomId);
            elements.hubShareUrlInput.value = shareUrl;

            // Network status badge & test button
            if (elements.hubNetworkBadge && elements.hubNetworkDesc) {
                const isLocal = typeof isLocalhostHost === "function" ? isLocalhostHost(window.location.hostname) : false;
                if (isLocal) {
                    elements.hubNetworkBadge.textContent = "🌐 PUBLIC HOSTING LINK";
                    elements.hubNetworkDesc.textContent = "Deploy to Firebase Hosting so other phones & PCs can open this link.";
                    if (elements.hubLocalTabBtn) elements.hubLocalTabBtn.style.display = "inline-flex";
                } else {
                    elements.hubNetworkBadge.textContent = "🟢 LIVE ONLINE LINK";
                    elements.hubNetworkDesc.textContent = "Anyone across the internet can join instantly from this link.";
                    if (elements.hubLocalTabBtn) elements.hubLocalTabBtn.style.display = "none";
                }
            }

            // Update arena labels
            this.updateFighterLabels();
            this.resetOnlineWeaponDock();
        }

        updateFighterLabels() {
            if (state.online.role === "host") {
                elements.p1NameDisplay.textContent = `${state.online.playerName} (YOU)`;
                elements.p2NameDisplay.textContent = state.online.opponentName || "WAITING...";
                elements.p1ScoreLabel.textContent = "YOUR SCORE";
                elements.p2ScoreLabel.textContent = "OPPONENT";
            } else {
                elements.p1NameDisplay.textContent = state.online.opponentName || "HOST";
                elements.p2NameDisplay.textContent = `${state.online.playerName} (YOU)`;
                elements.p1ScoreLabel.textContent = "HOST";
                elements.p2ScoreLabel.textContent = "YOUR SCORE";
            }
            elements.p2ScoreIcon.textContent = "🌐";
        }

        attachRoomListeners() {
            if (!this.roomRef) return;

            const roomListener = this.roomRef.on("value", snap => {
                if (!snap.exists()) {
                    showToast("Room has been closed or removed.");
                    this.leaveRoom(false);
                    return;
                }

                const data = snap.val();
                state.online.roomData = data;

                // Sync scores & match target
                state.seriesTarget = data.seriesTarget !== undefined ? data.seriesTarget : 3;
                state.scores = data.scores || { p1: 0, p2: 0, draws: 0 };
                state.roundNumber = data.round || 1;

                // Determine opponent name
                if (state.online.role === "host") {
                    state.online.opponentName = data.guestName || "Waiting for Challenger...";
                    state.online.opponentConnected = data.p2Connected === true;
                } else {
                    state.online.opponentName = data.hostName || "Host";
                    state.online.opponentConnected = data.p1Connected === true;
                }

                this.updateFighterLabels();
                renderScoreboard();

                // Hub status indicator
                if (!data.guestId) {
                    elements.hubWaitingBox.style.display = "block";
                    elements.hubStatusDot.className = "status-pulse-dot";
                    elements.hubStatusText.textContent = "Waiting for challenger to join...";
                } else if (!state.online.opponentConnected) {
                    elements.hubWaitingBox.style.display = "none";
                    elements.hubStatusDot.className = "status-pulse-dot disconnected";
                    elements.hubStatusText.textContent = "⚠️ Opponent disconnected. Waiting to reconnect...";
                    elements.userCaption.textContent = "Opponent disconnected";
                    elements.compCaption.textContent = "Awaiting reconnection...";
                } else {
                    elements.hubWaitingBox.style.display = "none";
                    elements.hubStatusDot.className = "status-pulse-dot connected";
                    elements.hubStatusText.textContent = "Challenger Connected & Ready!";
                }

                // Handle Move Lock Displays
                this.handleMoveLockStates(data);
            });

            this.listeners.push({ ref: this.roomRef, event: "value", fn: roomListener });
        }

        handleMoveLockStates(data) {
            // Secret Lock Indicators
            const isHost = state.online.role === "host";

            // If game is in playing state
            if (data.status === "playing" || data.status === "waiting") {
                // Host move display
                if (data.p1Locked) {
                    if (isHost) {
                        elements.userCaption.textContent = "Your move is locked in! 🔒";
                    } else {
                        renderMove(elements.userMove, null, true, false);
                        elements.userCaption.textContent = `${data.hostName} is locked in! 🔒`;
                    }
                } else {
                    if (isHost && !state.online.myLocked) {
                        renderMove(elements.userMove, null);
                        elements.userCaption.textContent = "Choose your weapon";
                    }
                }

                // Guest move display
                if (data.p2Locked) {
                    if (!isHost) {
                        elements.compCaption.textContent = "Your move is locked in! 🔒";
                    } else {
                        renderMove(elements.compMove, null, true, true);
                        elements.compCaption.textContent = `${data.guestName} is locked in! 🔒`;
                    }
                } else {
                    if (!isHost && !state.online.myLocked) {
                        renderMove(elements.compMove, null);
                        elements.compCaption.textContent = "Choose your weapon";
                    }
                }

                // Host coordinates simultaneous clash once both have locked in
                if (this.isHost && data.p1Locked && data.p2Locked && !state.isResolving) {
                    this.resolveOnlineRound(data);
                }
            }
            // If clash resolution broadcast received from Host
            else if (data.status === "revealing" && !state.isResolving) {
                this.executeOnlineClashReveal(data);
            }
        }

        resolveOnlineRound(data) {
            state.isResolving = true;

            const p1Choice = data.p1Choice;
            const p2Choice = data.p2Choice;
            const outcome = evaluateRound(p1Choice, p2Choice);

            const newScores = {
                p1: data.scores.p1 + (outcome === "p1" ? 1 : 0),
                p2: data.scores.p2 + (outcome === "p2" ? 1 : 0),
                draws: data.scores.draws + (outcome === "draw" ? 1 : 0)
            };

            // Write revealing state to database to synchronize both screens
            this.roomRef.update({
                status: "revealing",
                outcome: outcome,
                scores: newScores,
                winner: outcome
            });
        }

        executeOnlineClashReveal(data) {
            executeClash(data.p1Choice, data.p2Choice, (outcome, matchEnded) => {
                // Host handles progression to next round
                if (this.isHost && !matchEnded) {
                    setTimeout(() => {
                        this.roomRef.update({
                            status: "playing",
                            p1Locked: false,
                            p2Locked: false,
                            p1Choice: null,
                            p2Choice: null,
                            round: (data.round || 1) + 1
                        });
                    }, 2500);
                }

                // Reset local pick state for next round
                setTimeout(() => {
                    this.resetOnlineWeaponDock();
                }, 1500);
            });
        }

        makeMove(choice) {
            if (!this.roomRef || state.isResolving) return;

            if (!state.online.opponentConnected && !this.isHost) {
                showToast("Waiting for opponent connection...");
                return;
            }

            if (state.online.myLocked) {
                showToast("Your move is already locked in! 🔒");
                return;
            }

            sound.playLock();
            state.online.myLocked = true;
            state.online.myChoice = choice;

            // Highlight choice on user's dock
            elements.onlineChoiceButtons.forEach(btn => {
                btn.classList.toggle("selected", btn.dataset.move === choice);
            });

            elements.onlineLockStatusText.innerHTML = `<strong>Move Locked:</strong> You picked <strong>${MOVE_DATA[choice].label}</strong>! Waiting for opponent...`;

            if (state.online.role === "host") {
                renderMove(elements.userMove, choice, true, false);
                elements.userCaption.textContent = "Your move is locked in! 🔒";
                this.roomRef.update({
                    p1Locked: true,
                    p1Choice: choice
                });
            } else {
                renderMove(elements.compMove, choice, true, true);
                elements.compCaption.textContent = "Your move is locked in! 🔒";
                this.roomRef.update({
                    p2Locked: true,
                    p2Choice: choice
                });
            }
        }

        resetOnlineWeaponDock() {
            state.online.myLocked = false;
            state.online.myChoice = null;

            elements.onlineChoiceButtons.forEach(btn => {
                btn.classList.remove("selected");
            });

            elements.onlineLockStatusText.innerHTML = `<strong>Secret Move Selection:</strong> Your choice is masked from your opponent until both lock in!`;

            if (state.online.role === "host") {
                elements.userCaption.textContent = "Choose your weapon";
                elements.compCaption.textContent = state.online.opponentConnected ? "Waiting for opponent..." : "Awaiting opponent...";
            } else {
                elements.compCaption.textContent = "Choose your weapon";
                elements.userCaption.textContent = state.online.opponentConnected ? "Waiting for opponent..." : "Awaiting opponent...";
            }
        }

        setupChat() {
            if (!this.db || !state.online.roomId) return;

            this.chatRef = this.db.ref("rooms/" + state.online.roomId + "/chat");
            elements.chatMessages.innerHTML = `<div class="chat-system-msg">Room connected! Transmit messages below.</div>`;

            const chatListener = this.chatRef.limitToLast(40).on("child_added", snap => {
                const msgData = snap.val();
                this.appendChatMessage(msgData);
            });

            this.listeners.push({ ref: this.chatRef, event: "child_added", fn: chatListener });
        }

        sendChat(text) {
            const clean = (text || "").trim();
            if (!clean || !this.chatRef) return;

            this.chatRef.push({
                senderId: state.online.playerId,
                senderRole: state.online.role,
                senderName: state.online.playerName,
                text: clean,
                time: firebase.database.ServerValue.TIMESTAMP
            }).catch(err => {
                console.error("Chat send error:", err);
                if (err.code === "PERMISSION_DENIED") {
                    showToast("Chat permission denied: Check Firebase Rules");
                }
            });

            if (elements.chatInput) {
                elements.chatInput.value = "";
            }
        }

        appendChatMessage(msgData) {
            if (!elements.chatMessages) return;

            const isMe = msgData.senderId === state.online.playerId;
            const bubble = document.createElement("div");
            bubble.className = `chat-bubble ${msgData.senderRole === "host" ? "host-bubble" : "guest-bubble"}`;

            const nameSpan = document.createElement("span");
            nameSpan.className = "chat-sender-name";
            nameSpan.textContent = isMe ? `${msgData.senderName} (YOU)` : msgData.senderName;

            const textSpan = document.createElement("span");
            textSpan.className = "chat-text";
            textSpan.textContent = msgData.text;

            bubble.appendChild(nameSpan);
            bubble.appendChild(textSpan);

            elements.chatMessages.appendChild(bubble);
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

            if (!isMe) {
                sound.playMessage();
                if (state.online.chatMinimized) {
                    state.online.unreadChat++;
                    elements.chatUnreadBadge.textContent = state.online.unreadChat;
                    elements.chatUnreadBadge.style.display = "inline-block";
                }
            }
        }

        leaveRoom(manual = true) {
            if (this.roomRef) {
                if (state.online.role === "host") {
                    this.roomRef.child("p1Connected").set(false);
                } else if (state.online.role === "guest") {
                    this.roomRef.child("p2Connected").set(false);
                }
            }

            // Remove attached listeners cleanly
            this.detachRoomListeners();

            sessionStorage.removeItem("rps_session_room");
            sessionStorage.removeItem("rps_session_role");

            state.online.roomId = null;
            state.online.role = null;
            state.online.myLocked = false;
            state.online.myChoice = null;
            state.online.roomData = null;

            elements.onlineRoomHub.style.display = "none";
            elements.onlineControls.style.display = "none";
            elements.arenaChatPanel.style.display = "none";
            elements.chatToggleBtn.style.display = "none";
            elements.onlineLobby.style.display = "block";

            resetMatch(false);

            if (manual) {
                showToast("You left the battle room.");
            }
        }

        checkAutoJoinURL() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const roomParam = urlParams.get("room");
                if (roomParam) {
                    setGameMode("online");
                    if (elements.joinRoomInput) {
                        elements.joinRoomInput.value = roomParam;
                    }
                    setTimeout(() => {
                        this.joinRoom(roomParam);
                    }, 400);
                } else {
                    // Check session recovery
                    const savedRoom = sessionStorage.getItem("rps_session_room");
                    if (savedRoom) {
                        setGameMode("online");
                        setTimeout(() => {
                            this.joinRoom(savedRoom);
                        }, 400);
                    }
                }
            } catch (e) { }
        }
    }

    const onlineManager = new OnlineMultiplayerManager();

    // ========================================================================
    // MODE SWITCHING (CPU, PVP, ONLINE)
    // ========================================================================
    function setGameMode(mode) {
        if (state.mode === mode) return;

        state.mode = mode;
        sound.playClick();

        // Update tabs active class
        elements.tabCpu.classList.toggle("active", mode === "cpu");
        elements.tabPvp.classList.toggle("active", mode === "pvp");
        elements.tabOnline.classList.toggle("active", mode === "online");

        // Visibility switches
        if (mode === "cpu") {
            elements.soloControls.style.display = "block";
            elements.pvpControls.style.display = "none";
            elements.onlineLobby.style.display = "none";
            elements.onlineRoomHub.style.display = "none";
            elements.onlineControls.style.display = "none";
            elements.arenaChatPanel.style.display = "none";
            elements.chatToggleBtn.style.display = "none";
            elements.seriesBar.style.display = "flex";

            elements.p1NameDisplay.textContent = "YOU";
            elements.p2NameDisplay.textContent = "COMPUTER";
            elements.p1ScoreLabel.textContent = "YOUR SCORE";
            elements.p2ScoreLabel.textContent = "CPU SCORE";
            elements.p2ScoreIcon.textContent = "🤖";
            elements.p2Dot.className = "status-dot cpu-dot";

            elements.heroEyebrow.textContent = "READY YOUR STRATEGY";
            elements.heroTitle.innerHTML = "Make your <span>move.</span>";
            elements.heroSubtitle.textContent = "One choice. One opponent. Let the championship battle begin.";
        } else if (mode === "pvp") {
            elements.soloControls.style.display = "none";
            elements.pvpControls.style.display = "block";
            elements.onlineLobby.style.display = "none";
            elements.onlineRoomHub.style.display = "none";
            elements.onlineControls.style.display = "none";
            elements.arenaChatPanel.style.display = "none";
            elements.chatToggleBtn.style.display = "none";
            elements.seriesBar.style.display = "flex";

            elements.p1NameDisplay.textContent = "PLAYER 1";
            elements.p2NameDisplay.textContent = "PLAYER 2";
            elements.p1ScoreLabel.textContent = "PLAYER 1";
            elements.p2ScoreLabel.textContent = "PLAYER 2";
            elements.p2ScoreIcon.textContent = "💜";
            elements.p2Dot.className = "status-dot cpu-dot";

            elements.heroEyebrow.textContent = "LOCAL MULTIPLAYER DUEL";
            elements.heroTitle.innerHTML = "Simultaneous <span>Showdown.</span>";
            elements.heroSubtitle.textContent = "Two warriors, one arena. Secret lock-ins ensure pure tactical rivalry.";

            resetPvpReadiness();
        } else if (mode === "online") {
            elements.soloControls.style.display = "none";
            elements.pvpControls.style.display = "none";
            elements.seriesBar.style.display = "none";

            elements.heroEyebrow.textContent = "GLOBAL ONLINE ARENA";
            elements.heroTitle.innerHTML = "Battle Real <span>Opponents.</span>";
            elements.heroSubtitle.textContent = "Real-time synchronized duel across different devices and networks.";

            if (state.online.roomId) {
                elements.onlineLobby.style.display = "none";
                elements.onlineRoomHub.style.display = "block";
                elements.onlineControls.style.display = "block";
                elements.arenaChatPanel.style.display = "block";
                elements.chatToggleBtn.style.display = "flex";
            } else {
                elements.onlineLobby.style.display = "block";
                elements.onlineRoomHub.style.display = "none";
                elements.onlineControls.style.display = "none";
                elements.arenaChatPanel.style.display = "none";
                elements.chatToggleBtn.style.display = "none";
            }
        }

        resetMatch(false);
    }

    // ========================================================================
    // MATCH RESET
    // ========================================================================
    function resetMatch(playSound = true) {
        if (playSound) sound.playClick();

        state.scores.p1 = 0;
        state.scores.p2 = 0;
        state.scores.draws = 0;
        state.streak = 0;
        state.roundNumber = 1;
        state.isResolving = false;
        state.pvp.p1Choice = null;
        state.pvp.p2Choice = null;

        renderScoreboard();

        renderMove(elements.userMove, null);
        renderMove(elements.compMove, null);

        if (state.mode === "cpu") {
            elements.userCaption.textContent = "Ready for battle";
            elements.compCaption.textContent = "Waiting for your move";
            elements.choiceButtons.forEach(btn => btn.classList.remove("selected"));
        } else if (state.mode === "pvp") {
            resetPvpReadiness();
        } else if (state.mode === "online") {
            onlineManager.resetOnlineWeaponDock();
        }

        elements.resultPanel.classList.remove("win", "lose", "draw");
        elements.resultKicker.textContent = "BATTLE STATUS";
        elements.msg.textContent = state.mode === "cpu" ? "Your move, champion." : (state.mode === "online" ? "Online Battle Ready!" : "Make your secret picks!");
        elements.resultDetail.textContent = "Choose rock, paper or scissors to start a round.";
        elements.resultSymbol.textContent = "✦";

        elements.champModal.style.display = "none";
    }

    // ========================================================================
    // EVENT LISTENERS INITIALIZATION
    // ========================================================================
    function initListeners() {
        // Mode Tabs
        elements.tabCpu.addEventListener("click", () => setGameMode("cpu"));
        elements.tabPvp.addEventListener("click", () => setGameMode("pvp"));
        elements.tabOnline.addEventListener("click", () => setGameMode("online"));

        // Sound Toggle
        elements.soundBtn.addEventListener("click", () => {
            sound.toggle();
            updateSoundButton();
            if (sound.enabled) sound.playClick();
        });

        // Chat Toggle Button (in topbar)
        elements.chatToggleBtn.addEventListener("click", () => {
            sound.playClick();
            const panel = elements.arenaChatPanel;
            if (panel.style.display === "none") {
                panel.style.display = "block";
                state.online.chatMinimized = false;
                state.online.unreadChat = 0;
                elements.chatUnreadBadge.style.display = "none";
            } else {
                panel.style.display = "none";
            }
        });

        // Chat Minimize Button
        elements.chatMinimizeBtn.addEventListener("click", () => {
            sound.playClick();
            elements.arenaChatPanel.classList.toggle("minimized");
            state.online.chatMinimized = elements.arenaChatPanel.classList.contains("minimized");
            if (!state.online.chatMinimized) {
                state.online.unreadChat = 0;
                elements.chatUnreadBadge.style.display = "none";
            }
        });

        // Chat Form Submit
        elements.chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            onlineManager.sendChat(elements.chatInput.value);
        });

        // Quick Reaction Chips
        elements.chatReactionChips.forEach(chip => {
            chip.addEventListener("click", () => {
                onlineManager.sendChat(chip.dataset.reaction);
            });
        });

        // Controls Modal
        elements.controlsBtn.addEventListener("click", () => {
            sound.playClick();
            elements.controlsModal.style.display = "grid";
        });
        elements.modalCloseBtn.addEventListener("click", () => {
            sound.playClick();
            elements.controlsModal.style.display = "none";
        });
        elements.modalOkBtn.addEventListener("click", () => {
            sound.playClick();
            elements.controlsModal.style.display = "none";
        });
        elements.controlsModal.addEventListener("click", (e) => {
            if (e.target === elements.controlsModal) {
                elements.controlsModal.style.display = "none";
            }
        });

        // Cloud Setup Modal
        function openCloudModal() {
            sound.playClick();
            try {
                const active = (typeof getActiveFirebaseConfig === "function") ? getActiveFirebaseConfig() : {};
                const isConfigured = (typeof isFirebaseConfigured === "function") ? isFirebaseConfigured(active) : false;

                if (isConfigured) {
                    elements.firebaseConfigTextarea.value = JSON.stringify(active, null, 2);
                } else {
                    // Pre-fill clean template for the user to paste into
                    elements.firebaseConfigTextarea.value = JSON.stringify({
                        apiKey: "",
                        authDomain: "your-project.firebaseapp.com",
                        databaseURL: "https://your-project-default-rtdb.firebaseio.com",
                        projectId: "your-project",
                        storageBucket: "your-project.appspot.com",
                        messagingSenderId: "",
                        appId: ""
                    }, null, 2);
                }

                if (elements.customHostingDomainInput && typeof getCustomHostingUrl === "function") {
                    elements.customHostingDomainInput.value = getCustomHostingUrl() || "";
                }
            } catch (e) { }
            elements.cloudModal.style.display = "grid";
        }

        elements.cloudSetupBtn.addEventListener("click", openCloudModal);
        elements.cloudModalLink.addEventListener("click", openCloudModal);
        if (elements.lobbyConfigAlertBtn) {
            elements.lobbyConfigAlertBtn.addEventListener("click", openCloudModal);
        }
        elements.cloudModalCloseBtn.addEventListener("click", () => {
            sound.playClick();
            elements.cloudModal.style.display = "none";
        });
        elements.cloudModal.addEventListener("click", (e) => {
            if (e.target === elements.cloudModal) {
                elements.cloudModal.style.display = "none";
            }
        });

        // Save Custom Firebase Config
        elements.cloudSaveBtn.addEventListener("click", async () => {
            sound.playClick();
            const rawVal = elements.firebaseConfigTextarea.value;
            const parsed = (typeof parseFirebaseConfigInput === "function")
                ? parseFirebaseConfigInput(rawVal)
                : null;

            if (!parsed || typeof parsed !== "object") {
                alert("Invalid format!\n\nPlease paste a valid Firebase configuration JSON or JS object snippet copied from Firebase Console.");
                return;
            }

            const url = (parsed.databaseURL || "").trim();
            const key = (parsed.apiKey || "").trim();
            const pid = (parsed.projectId || "").trim();

            if (!url) {
                alert("Missing 'databaseURL'!\n\nIn Firebase Console, make sure you clicked: Build -> Realtime Database -> Create Database.\nCopy the databaseURL (e.g. https://your-project-default-rtdb.firebaseio.com).");
                return;
            }

            if (!url.startsWith("https://") || (!url.includes(".firebaseio.com") && !url.includes(".firebasedatabase.app"))) {
                alert("Invalid 'databaseURL'!\n\nRealtime Database URLs must start with 'https://' and end with '.firebaseio.com' or '.firebasedatabase.app'.");
                return;
            }

            if (!key) {
                alert("Missing 'apiKey'!\n\nPlease paste the full firebaseConfig object from Firebase Console -> Project Settings -> Your apps.");
                return;
            }

            if (!pid) {
                alert("Missing 'projectId'!\n\nPlease include 'projectId' in the configuration.");
                return;
            }

            if (typeof saveCustomFirebaseConfig === "function") {
                saveCustomFirebaseConfig(parsed);
            }

            if (elements.customHostingDomainInput && typeof saveCustomHostingUrl === "function") {
                saveCustomHostingUrl(elements.customHostingDomainInput.value.trim());
            }

            showToast("Firebase configuration saved! Connecting... 🟢");
            elements.cloudModal.style.display = "none";
            await onlineManager.initFirebase();
        });

        // Reset Firebase Config
        elements.cloudResetBtn.addEventListener("click", async () => {
            sound.playClick();
            if (typeof resetFirebaseConfig === "function") {
                resetFirebaseConfig();
            }
            if (elements.customHostingDomainInput && typeof saveCustomHostingUrl === "function") {
                saveCustomHostingUrl("");
                elements.customHostingDomainInput.value = "";
            }
            try {
                elements.firebaseConfigTextarea.value = JSON.stringify({
                    apiKey: "",
                    authDomain: "your-project.firebaseapp.com",
                    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
                    projectId: "your-project",
                    storageBucket: "your-project.appspot.com",
                    messagingSenderId: "",
                    appId: ""
                }, null, 2);
            } catch (e) { }
            showToast("Cleared custom configuration.");
            await onlineManager.initFirebase();
        });

        // Online Lobby: Series chip selection
        elements.lobbySeriesChips.forEach(chip => {
            chip.addEventListener("click", () => {
                sound.playClick();
                elements.lobbySeriesChips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                onlineManager.selectedLobbySeries = parseInt(chip.dataset.series, 10);
            });
        });

        // Online Lobby: Create Room Button
        elements.createRoomBtn.addEventListener("click", () => {
            sound.playClick();
            onlineManager.createRoom();
        });

        // Online Lobby: Join Room Button
        elements.joinRoomBtn.addEventListener("click", () => {
            sound.playClick();
            onlineManager.joinRoom(elements.joinRoomInput.value);
        });

        elements.joinRoomInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                onlineManager.joinRoom(elements.joinRoomInput.value);
            }
        });

        // Active Room Hub: Copy Code
        elements.hubCopyCodeBtn.addEventListener("click", () => {
            sound.playClick();
            if (state.online.roomId) {
                navigator.clipboard.writeText(state.online.roomId).then(() => {
                    showToast(`Room Code ${state.online.roomId} copied! 📋`);
                });
            }
        });

        // Active Room Hub: Copy URL Link
        elements.hubCopyUrlBtn.addEventListener("click", () => {
            sound.playClick();
            const url = elements.hubShareUrlInput.value;
            if (url) {
                navigator.clipboard.writeText(url).then(() => {
                    showToast("Invite link copied to clipboard! 📋");
                }).catch(() => {
                    elements.hubShareUrlInput.select();
                    document.execCommand("copy");
                    showToast("Invite link copied! 📋");
                });
            }
        });

        // Active Room Hub: Web Share API
        elements.hubShareUrlBtn.addEventListener("click", () => {
            sound.playClick();
            const url = elements.hubShareUrlInput.value;
            if (navigator.share) {
                navigator.share({
                    title: "Rock Paper Scissors Pro Duel",
                    text: `Battle me online in Rock Paper Scissors Pro! Room: ${state.online.roomId}`,
                    url: url
                }).catch(() => { });
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    showToast("Invite link copied to clipboard! 📋");
                });
            }
        });

        // Active Room Hub: Local Tab Test Button (opens room in 2nd tab on same PC)
        if (elements.hubLocalTabBtn) {
            elements.hubLocalTabBtn.addEventListener("click", () => {
                sound.playClick();
                if (!state.online.roomId) return;
                const localUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(state.online.roomId)}`;
                window.open(localUrl, "_blank");
                showToast("Opening room in a 2nd local tab for testing! ⚔️");
            });
        }

        // Active Room Hub: Leave Room Button
        elements.hubLeaveBtn.addEventListener("click", () => {
            sound.playClick();
            if (confirm("Are you sure you want to leave this battle room?")) {
                onlineManager.leaveRoom(true);
            }
        });

        // Championship Rematch
        elements.champRematchBtn.addEventListener("click", () => {
            if (state.mode === "online") {
                if (onlineManager.isHost && onlineManager.roomRef) {
                    onlineManager.roomRef.update({
                        scores: { p1: 0, p2: 0, draws: 0 },
                        round: 1,
                        status: "playing",
                        p1Locked: false,
                        p2Locked: false,
                        p1Choice: null,
                        p2Choice: null,
                        winner: null
                    });
                } else if (onlineManager.roomRef) {
                    onlineManager.sendChat("I request a rematch! ⚔️");
                }
                elements.champModal.style.display = "none";
            } else {
                resetMatch(true);
            }
        });

        // Series selection buttons (Solo & Local)
        elements.seriesButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                sound.playClick();
                elements.seriesButtons.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-checked", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-checked", "true");
                state.seriesTarget = parseInt(btn.dataset.series, 10);
                resetMatch(false);
            });
        });

        // Solo Move Buttons
        elements.choiceButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                if (state.mode === "cpu") {
                    playSoloGame(btn.dataset.move);
                }
            });
        });

        // Local PvP Choice Buttons
        elements.pvpChoiceButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                if (state.mode === "pvp") {
                    const playerNum = parseInt(btn.dataset.player, 10);
                    const move = btn.dataset.move;
                    handlePvpPick(playerNum, move);
                }
            });
        });

        // Online Choice Buttons
        elements.onlineChoiceButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                if (state.mode === "online") {
                    onlineManager.makeMove(btn.dataset.move);
                }
            });
        });

        // Reset Button
        elements.resetBtn.addEventListener("click", () => {
            if (state.mode === "online") {
                if (onlineManager.isHost && onlineManager.roomRef) {
                    onlineManager.roomRef.update({
                        scores: { p1: 0, p2: 0, draws: 0 },
                        round: 1,
                        status: "playing",
                        p1Locked: false,
                        p2Locked: false,
                        p1Choice: null,
                        p2Choice: null,
                        winner: null
                    });
                    showToast("Match scores reset by Host.");
                } else {
                    showToast("Only the room Host can reset tournament match scores.");
                }
            } else {
                resetMatch(true);
            }
        });

        // Universal Keyboard Controls
        window.addEventListener("keydown", (e) => {
            if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

            const key = e.key.toLowerCase();

            // Global Shortcuts
            if (key === "m") {
                sound.toggle();
                updateSoundButton();
                if (sound.enabled) sound.playClick();
                return;
            }
            if (key === " " && !e.repeat && state.mode !== "online") {
                e.preventDefault();
                resetMatch(true);
                return;
            }
            if (key === "escape") {
                elements.controlsModal.style.display = "none";
                elements.champModal.style.display = "none";
                elements.cloudModal.style.display = "none";
                return;
            }

            // Mode: CPU Solo
            if (state.mode === "cpu") {
                if (key === "1" || key === "r") playSoloGame("rock");
                else if (key === "2" || key === "p") playSoloGame("paper");
                else if (key === "3" || key === "s") playSoloGame("scissors");
            }
            // Mode: 2-Player Local Duel
            else if (state.mode === "pvp") {
                if (key === "a") handlePvpPick(1, "rock");
                else if (key === "s") handlePvpPick(1, "paper");
                else if (key === "d") handlePvpPick(1, "scissors");

                if (key === "j" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    handlePvpPick(2, "rock");
                } else if (key === "k" || e.key === "ArrowUp") {
                    e.preventDefault();
                    handlePvpPick(2, "paper");
                } else if (key === "l" || e.key === "ArrowRight") {
                    e.preventDefault();
                    handlePvpPick(2, "scissors");
                }
            }
            // Mode: Online Multiplayer
            else if (state.mode === "online" && state.online.roomId) {
                if (key === "1" || key === "r") onlineManager.makeMove("rock");
                else if (key === "2" || key === "p") onlineManager.makeMove("paper");
                else if (key === "3" || key === "s") onlineManager.makeMove("scissors");
            }
        });
    }

    // ========================================================================
    // STARTUP INITIALIZATION
    // ========================================================================
    function init() {
        initListeners();
        renderScoreboard();
        onlineManager.checkAutoJoinURL();
    }

    // Boot once DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
