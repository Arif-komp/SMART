// =========================================
// FILE: script.js - SMART SWALAYAN
// Sensor Scanning Maksimal dan Optimis UI Reset
// =========================================

// --- PENTING: GANTI DENGAN URL APPS SCRIPT ANDA ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxazk7JGZX7pli3ydC8extqRgik-R19V_LBFIEpeUXNipgKjxhVKh9tgs4uEL5Mog/exec'; 
// --- AKHIR PENTING ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Variabel DOM
    const form = document.getElementById('inventoryForm');
    const tanggalInput = document.getElementById('tanggal');
    const barcodeInput = document.getElementById('barcode');
    const lokasiInput = document.getElementById('lokasi');
    const qtyInput = document.getElementById('qty');
    const scanButton = document.getElementById('scanButton');
    const scannerContainer = document.getElementById('scanner-container');
    const videoFeed = document.getElementById('video-feed');
    const scannerMessage = document.getElementById('scanner-message');
    const messageElement = document.getElementById('message');
    
    let isScanning = false;
    
    // Inisialisasi ZXing Reader dengan opsi sensitivitas tinggi
    const hints = new Map();
    // Tambahkan semua format Barcode/QR yang umum
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
        ZXing.BarcodeFormat.CODE_128,
        ZXing.BarcodeFormat.QR_CODE,
        ZXing.BarcodeFormat.EAN_13,
        ZXing.BarcodeFormat.EAN_8,
        ZXing.BarcodeFormat.CODE_39,
        ZXing.BarcodeFormat.ITF,
        ZXing.BarcodeFormat.AZTEC,
        ZXing.BarcodeFormat.DATA_MATRIX
    ]);
    // Set resolusi video yang lebih tinggi untuk deteksi yang lebih baik
    const controls = {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment' // Prioritaskan kamera belakang
        }
    };

    const codeReader = new ZXing.BrowserMultiFormatReader(hints);

    // 2. Set Tanggal Otomatis
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    const setTodayDate = () => {
        tanggalInput.value = `${yyyy}-${mm}-${dd}`;
    };

    setTodayDate();
    lokasiInput.focus();
    
    // =========================================
    // 3. LOGIKA SCANNER BARCODE (ZXing-JS)
    // =========================================

    const stopScanner = () => {
        if (!isScanning) return;
        
        isScanning = false;
        codeReader.reset();
        scannerContainer.classList.remove('active');
        videoFeed.style.display = 'none';
        scannerMessage.style.display = 'block';
        scanButton.innerHTML = '<i class="fas fa-camera-retro"></i> SCAN';
        messageElement.textContent = 'Scanning dihentikan.';
    };

    const startScanner = () => {
        isScanning = true;
        scannerContainer.classList.add('active');
        videoFeed.style.display = 'block';
        scannerMessage.style.display = 'none';
        scanButton.innerHTML = '<i class="fas fa-stop-circle"></i> STOP';
        messageElement.textContent = 'Mengaktifkan kamera... Arahkan ke barcode.';
        messageElement.classList.add('show');
        
        // Memulai decode dengan kontrol video sensitif
        codeReader.decodeFromVideoDevice(
            undefined, 
            'video-feed', 
            (result, error) => {
                if (result) {
                    // --- BARCODE BERHASIL DI-SCAN ---
                    const scannedCode = result.text;
                    barcodeInput.value = scannedCode;
                    
                    stopScanner(); 
                    
                    messageElement.textContent = `✅ Barcode ${scannedCode} berhasil di-scan!`;
                    messageElement.classList.add('show');
                    
                    qtyInput.focus();

                } else if (error && !(error instanceof ZXing.NotFoundException)) {
                    // Hanya log error non-fatal (seperti tidak menemukan barcode)
                    console.error('Scan Error:', error);
                }
            },
            controls // Menggunakan kontrol resolusi tinggi
        ).catch(err => {
            console.error('Kamera gagal diakses:', err);
            stopScanner();
            messageElement.textContent = '❌ Gagal mengakses kamera. Pastikan browser memiliki izin HTTPS.';
        });
    };

    scanButton.addEventListener('click', () => {
        if (isScanning) {
            stopScanner();
        } else {
            startScanner();
        }
    });

    // =========================================
    // 4. LOGIKA PENGIRIMAN FORM (Optimis UI Reset)
    // =========================================
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (isScanning) {
            stopScanner();
        }

        const data = {
            lokasi: lokasiInput.value,
            barcode: barcodeInput.value,
            qty: qtyInput.value,
            tanggal: tanggalInput.value
        };

        if (!data.lokasi || !data.barcode || !data.qty) {
            messageElement.textContent = '❌ Harap isi semua kolom wajib.';
            messageElement.classList.add('show');
            setTimeout(() => { messageElement.classList.remove('show'); }, 3000);
            return;
        }

        // --- OPTIMIS UI: RESET FORM INSTAN SEBELUM FETCH ---
        messageElement.textContent = '⏳ Data sedang dikirim...';
        messageElement.classList.add('show');
        
        // 1. Reset Form dan Fokus Instan (membuat website terasa cepat)
        form.reset(); 
        setTodayDate();
        lokasiInput.focus();
        
        // 2. Siapkan data untuk pengiriman
        const formData = new URLSearchParams(data).toString();
        
        // 3. Lakukan pengiriman data di latar belakang
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData, 
        })
        .then(() => {
            // Setelah pengiriman, berikan feedback sukses (di latar belakang)
            messageElement.textContent = '✅ Data berhasil disimpan (di latar belakang)!';
            setTimeout(() => { 
                messageElement.classList.remove('show');
            }, 4000);
        })
        .catch(error => {
            // Jika ada error jaringan, informasikan pengguna
            console.error('Error saat fetch:', error);
            messageElement.textContent = '❌ Gagal mengirim data. Cek URL Apps Script atau koneksi.';
            setTimeout(() => { messageElement.classList.remove('show'); }, 5000);
        });
    });
});
