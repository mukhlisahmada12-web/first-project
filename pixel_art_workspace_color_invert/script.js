// --- 1. VARIABEL AWAL ---
let warnaKuas = "rgb(255, 102, 46)"; 
let modeIsi = false; 
let modePelangi = false; 
let mouseDitekan = false;

document.addEventListener('mousedown', () => mouseDitekan = true);
document.addEventListener('mouseup', () => mouseDitekan = false);

// --- 2. PEMBUATAN KANVAS ---
const canvas = document.querySelector('.canvas');
const totalKolom = 30;
const totalBaris = 15;
const semuaPixel = [];

// Fungsi untuk mendapatkan warna acak
function acakWarna() {
    const pilihanWarna = [
        "rgb(255, 102, 46)", "rgb(26, 218, 84)", "rgb(83, 15, 255)", 
        "rgb(255, 236, 26)", "rgb(142, 229, 255)", "rgb(156, 39, 176)", 
        "rgb(255, 152, 0)", "rgb(233, 30, 99)"
    ];
    return pilihanWarna[Math.floor(Math.random() * pilihanWarna.length)];
}

for (let i = 0; i < totalKolom * totalBaris; i++) {
    let pixel = document.createElement('div');
    pixel.classList.add('pixel');
    pixel.setAttribute('data-id', i);
    
    // Logika saat pixel diklik
    pixel.addEventListener('mousedown', function() {
        if (modePelangi) { warnaKuas = acakWarna(); }

        if (modeIsi) {
            let idDipilih = parseInt(pixel.getAttribute('data-id'));
            let barisAwal = Math.floor(idDipilih / totalKolom);
            let kolomAwal = idDipilih % totalKolom;

            semuaPixel.forEach((targetPixel, index) => {
                let barisTarget = Math.floor(index / totalKolom);
                let kolomTarget = index % totalKolom;
                let jarak = Math.abs(barisTarget - barisAwal) + Math.abs(kolomTarget - kolomAwal);
                
                let animasi = targetPixel.animate([ 
                    { backgroundColor: warnaKuas }
                ], {
                    duration: 300,
                    easing: 'ease-in-out',
                    delay: jarak * 30,
                    fill: 'forwards'
                });

                animasi.onfinish = function() {
                    targetPixel.style.backgroundColor = warnaKuas;
                    animasi.cancel();
                };
            });
        } else {
            pixel.style.backgroundColor = warnaKuas;
        }
    });

    // Logika saat pixel diseret (Drag)
    pixel.addEventListener('mouseenter', function() {
        if (mouseDitekan && !modeIsi) {
            if (modePelangi) { warnaKuas = acakWarna(); }
            pixel.style.backgroundColor = warnaKuas;
        }
    });

    canvas.appendChild(pixel);
    semuaPixel.push(pixel);
}

// --- 3. LOGIKA PALET & ALAT ---
const daftarWarna = document.querySelectorAll('.color-cell');
const penghapus = document.getElementById('tool-eraser');
const catTumpah = document.getElementById('tool-fill');
const kuasPelangi = document.getElementById('tool-rainbow');
const semuaAlat = [...daftarWarna, penghapus, catTumpah, kuasPelangi];

function hapusSeleksi() {
    semuaAlat.forEach(alat => alat.classList.remove('selected'));
}

// Klik Warna Biasa
daftarWarna.forEach(warna => {
    warna.addEventListener('click', function() {
        hapusSeleksi();
        warna.classList.add('selected');
        warnaKuas = warna.style.backgroundColor;
        modeIsi = false;
        modePelangi = false; // Matikan pelangi!
    });
});

// Klik Penghapus
penghapus.addEventListener('click', function() {
    hapusSeleksi();
    penghapus.classList.add('selected');
    warnaKuas = "rgb(255, 255, 255)"; 
    modeIsi = false;
    modePelangi = false; // Matikan pelangi!
});

// Klik Cat Tumpah
catTumpah.addEventListener('click', function() {
    hapusSeleksi();
    catTumpah.classList.add('selected');
    modeIsi = true;
    modePelangi = false; // Matikan pelangi!
});

// Klik Kuas Pelangi
kuasPelangi.addEventListener('click', function() {
    hapusSeleksi();
    kuasPelangi.classList.add('selected');
    modeIsi = false;
    modePelangi = true; 
});

// Set default awal
daftarWarna[0].classList.add('selected');

// --- 4. FITUR AKSI ---

// A. Sembunyikan Garis
document.getElementById('btn-grid').addEventListener('click', function() {
    canvas.classList.toggle('hide-grid');
});

// B. Inversi Warna
// Membalik setiap kanal RGB: warna baru = 255 - warna lama.
document.getElementById('btn-invert').addEventListener('click', () => {
    semuaPixel.forEach(pixel => {
        const warnaSaatIni = getComputedStyle(pixel).backgroundColor;
        const nilaiRGB = warnaSaatIni.match(/\d+/g);

        if (nilaiRGB && nilaiRGB.length >= 3) {
            const [r, g, b] = nilaiRGB.slice(0, 3).map(Number);
            pixel.style.backgroundColor = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
        }
    });
});

// C. Bersihkan Kanvas
document.getElementById('btn-clear').addEventListener('click', () => {
    if(confirm("Apakah Anda yakin ingin menghapus semua gambar?")) {
        semuaPixel.forEach(p => p.style.backgroundColor = "rgb(255, 255, 255)");
    }
});

// Kamus Kompresi
const kamusKode = {
    "1": "rgb(255, 102, 46)", "2": "rgb(26, 218, 84)", "3": "rgb(83, 15, 255)",
    "4": "rgb(255, 236, 26)", "5": "rgb(142, 229, 255)", "6": "rgb(156, 39, 176)",
    "7": "rgb(255, 152, 0)", "8": "rgb(233, 30, 99)", "0": "rgb(255, 255, 255)"
};
function hapusSpasi(str) { return str.replace(/\s/g, ''); }

// C. Simpan ke Cookie
document.getElementById('btn-save').addEventListener('click', () => {
    let dataSimpan = "";
    semuaPixel.forEach(p => {
        let warna = p.style.backgroundColor || "rgb(255, 255, 255)";
        let warnaBersih = hapusSpasi(warna);
        let kode = "0"; 
        for(let k in kamusKode) {
            if (hapusSpasi(kamusKode[k]) === warnaBersih) { kode = k; break; }
        }
        dataSimpan += kode;
    });
    document.cookie = "gambarPixel=" + dataSimpan + "; max-age=604800; path=/";
    alert("Karya berhasil disimpan di Cookie peramban!");
});

// D. Muat dari Cookie
document.getElementById('btn-load').addEventListener('click', () => {
    let barisCookie = document.cookie.split(';');
    let cookieKita = barisCookie.find(c => c.trim().startsWith('gambarPixel='));
    
    if (cookieKita) {
        let dataSimpan = cookieKita.split('=')[1];
        semuaPixel.forEach((p, index) => {
            let kode = dataSimpan[index];
            if (kode && kamusKode[kode]) { p.style.backgroundColor = kamusKode[kode]; }
        });
        alert("Gambar berhasil dimuat!");
    } else {
        alert("Tidak ada data gambar yang tersimpan.");
    }
});

// E. Unduh Gambar
document.getElementById('btn-download').addEventListener('click', () => {
    // Sembunyikan garis sementara agar hasil unduhan bersih layaknya karya seni murni
    canvas.classList.add('hide-grid'); 
    
    domtoimage.toPng(document.querySelector('.canvas-container'))
        .then(function (urlGambar) {
            let link = document.createElement('a');
            link.download = 'karya-piksel-saya.png';
            link.href = urlGambar;
            link.click();
            canvas.classList.remove('hide-grid'); // Kembalikan garis setelah selesai memotret
        })
        .catch(function (error) {
            alert("Terjadi kesalahan saat mengunduh.");
            canvas.classList.remove('hide-grid');
        });
});