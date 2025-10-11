// =========================================
// FILE: script.js - SMART SWALAYAN
// Integrasi Barcode Scanner (ZXing-JS) dan Apps Script
// =========================================

// --- PENTING: GANTI DENGAN URL APPS SCRIPT ANDA ---
const SCRIPT_URL = 'PASTE_URL_WEB_APP_APPS_SCRIPT_ANDA_DI_SINI'; 
// --- AKHIR PENTING ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Variabel DOM
    const form = document.getElementById('dataForm');
    const tanggalInput = document.getElementById('tanggal');
    const barcodeInput = document.getElementById('barcode');
    const lokasiInput = document.getElementById('lokasi');
    const scanButton = document.getElementById('scanButton');
    const scannerContainer = document.getElementById('scanner-container');
    const videoFeed = document.getElementById('video-feed');
    const messageElement = document.getElementById('message');
    
    let isScanning = false;
    
    // Asumsi: Library ZXing telah dimuat melalui CDN di index.html
    const codeReader = new ZXing.BrowserMultiFormatReader();

    // 2. Set Tanggal Otomatis (Tanggal Hari Ini)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Januari adalah 0!
    const dd = String(today.getDate()).padStart(2, '0');
    tanggalInput.value = `${yyyy}-${mm}-${dd}`;
    
    // Fokuskan input pertama saat halaman dimuat
    lokasiInput.focus();


    // =========================================
    // 3. LOGIKA SCANNER BARCODE (Menggunakan ZXing-JS)
    // =========================================

    // Fungsi untuk menghentikan scanner
    const stopScanner = () => {
        if (!isScanning) return;
        
        isScanning = false;
        codeReader.reset(); // Menghentikan kamera dan video stream
        scannerContainer.classList.remove('active');
        videoFeed.style.display = 'none';
        scanButton.innerHTML = '<i class="fas fa-camera-retro"></i> SCAN';
        messageElement.textContent = 'Scanning dihentikan.';
    };

    // Fungsi untuk memulai scanner
    const startScanner = () => {
        isScanning = true;
        scannerContainer.classList.add('active');
        videoFeed.style.display = 'block';
        scanButton.innerHTML = '<i class="fas fa-stop-circle"></i> STOP';
        messageElement.textContent = 'Mengaktifkan kamera... Arahkan ke barcode.';
        
        // Minta akses kamera dan mulai decoding
        codeReader.decodeFromVideoDevice(
            undefined, // Membiarkan ZXing memilih kamera terbaik (biasanya belakang)
            'video-feed', // ID elemen video
            (result, error) => {
                if (result) {
                    // --- BARCODE BERHASIL DI-SCAN ---
                    const scannedCode = result.text;
                    barcodeInput.value = scannedCode;
                    
                    stopScanner(); // Hentikan scanner setelah sukses
                    
                    messageElement.textContent = `✅ Barcode ${scannedCode} berhasil di-scan!`;
                    messageElement.classList.add('show');
                    
                    // Pindah fokus ke QTY
                    document.getElementById('qty').focus();

                } else if (error && !(error instanceof ZXing.NotFoundException)) {
                    // Tangani error selain 'Barcode tidak ditemukan'
                    console.error('Scan Error:', error);
                    messageElement.textContent = `⚠️ Error saat scan: ${error.message}`;
                }
            }
        ).catch(err => {
            console.error('Kamera gagal diakses:', err);
            stopScanner();
            messageElement.textContent = '❌ Gagal mengakses kamera. Pastikan browser memiliki izin.';
        });
    };


    // Event Listener untuk Tombol Scan
    scanButton.addEventListener('click', () => {
        if (isScanning) {
            stopScanner();
        } else {
            startScanner();
        }
    });

    // =========================================
    // 4. LOGIKA PENGIRIMAN FORM KE APPS SCRIPT
    // =========================================
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Hentikan scanner jika masih berjalan
        if (isScanning) {
            stopScanner();
        }

        const data = {
            lokasi: lokasiInput.value,
            barcode: barcodeInput.value,
            qty: document.getElementById('qty').value,
            tanggal: tanggalInput.value
        };

        // Validasi minimal
        if (!data.lokasi || !data.barcode || !data.qty) {
            messageElement.textContent = '❌ Harap isi semua kolom wajib.';
            messageElement.classList.add('show');
            setTimeout(() => { messageElement.classList.remove('show'); }, 3000);
            return;
        }

        // Tampilkan pesan loading
        messageElement.textContent = '⏳ Sedang menyimpan data...';
        messageElement.classList.add('show');

        fetch(SCRIPT_URL, {
            method: 'POST',
            // Gunakan mode 'no-cors' karena Apps Script sering diakses lintas domain
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(() => {
            // Dalam mode 'no-cors', kita hanya bisa mengasumsikan sukses jika fetch() tidak gagal.
            messageElement.textContent = '✅ Data berhasil disimpan ke Spreadsheet!';
            
            // Reset Formulir dan fokus
            form.reset(); 
            tanggalInput.value = `${yyyy}-${mm}-${dd}`; 
            lokasiInput.focus(); 
            
            setTimeout(() => { 
                messageElement.classList.remove('show');
            }, 4000);
        })
        .catch(error => {
            messageElement.textContent = '❌ Gagal mengirim data. Cek URL Apps Script atau koneksi.';
            console.error('Error:', error);
            
            setTimeout(() => { messageElement.classList.remove('show'); }, 5000);
        });
    });
});
