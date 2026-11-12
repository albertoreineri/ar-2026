// Musica: due brani in loop (calma e battaglia) con dissolvenza dall'uno all'altro. Licenze in assets/musica/LICENZE.txt
const VOLUME_MUSICA = 0.35, DISSOLVENZA = 1500, CODA_BATTAGLIA = 5; // ms; secondi di battaglia dopo l'ultimo nemico dell'ondata
let brani = {}, branoAttivo = null, codaBattaglia = 0, musicaSpenta = localStorage.getItem('musicaSpenta') === '1';

function caricaMusica(scene) {
    scene.load.audio('calma', 'assets/musica/calma.mp3');
    scene.load.audio('battaglia', 'assets/musica/battaglia.mp3');
}

function creaMusica(scene) {
    for (const nome of ['calma', 'battaglia']) brani[nome] = scene.sound.add(nome, { loop: true, volume: 0 });
    scene.sound.mute = musicaSpenta;
    scene.sound.pauseOnBlur = false; // la musica non si ferma quando si cambia scheda
    const bottone = document.createElement('button');
    bottone.style.cssText = 'background: none; border: none; font-size: 18px; cursor: pointer; padding: 0 4px;';
    const aggiorna = () => bottone.textContent = musicaSpenta ? '🔇' : '🔊';
    bottone.onclick = () => {
        musicaSpenta = !musicaSpenta;
        scene.sound.mute = musicaSpenta;
        localStorage.setItem('musicaSpenta', musicaSpenta ? '1' : '0');
        aggiorna();
    };
    aggiorna();
    document.getElementById('hud').insertBefore(bottone, document.getElementById('msg'));
    cambiaBrano(scene, 'calma'); // parte al primo clic o tasto (il browser blocca l'audio prima)
}

function cambiaBrano(scene, nome) {
    branoAttivo = nome;
    for (const [n, s] of Object.entries(brani)) {
        if (n === nome && !s.isPlaying) s.play();
        scene.tweens.killTweensOf(s);
        scene.tweens.add({ targets: s, volume: n === nome ? VOLUME_MUSICA : 0, duration: DISSOLVENZA, onComplete: () => { if (n !== branoAttivo) s.pause(); } });
        if (n === nome && s.isPaused) s.resume();
    }
}

// battaglia finché ci sono nemici dell'ondata in campo (non i difensori del castello), più una breve coda
function aggiornaMusica(scene, dt) {
    if (stato.nemici.some(n => n.ondata)) codaBattaglia = CODA_BATTAGLIA; else codaBattaglia -= dt;
    const voluto = codaBattaglia > 0 ? 'battaglia' : 'calma';
    if (voluto !== branoAttivo) cambiaBrano(scene, voluto);
}
