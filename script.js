// =========================================
// FILE: script.js - SMART SWALAYAN
// Integrasi Barcode Scanner (ZXing-JS) dan Apps Script
// =========================================

// --- PENTING: GANTI DENGAN URL APPS SCRIPT ANDA ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxiMiPYa1rIk9e7TDrRD4pvug2JshEGt2pj3fj7iJG9ASSOrO_z14Nvoq8M69xGHZ6mAw/exec'; 
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
    
    // Inisialisasi ZXing Reader
    // Pastikan <script src="https://unpkg.com/@zxing/library@latest"></script> sudah ada di HTML
    const codeReader = new ZXing.BrowserMultiFormatReader();

    // 2. Set Tanggal Otomatis
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    tanggalInput.value = `${yyyy}-${mm}-${dd}`;
    lokasiInput.focus();
    
    // =========================================
    // 3. LOGIKA SCANNER BARCODE (ZXing-JS)
    // =========================================

    // Fungsi untuk menghentikan scanner
    const stopScanner = () => {
        if (!isScanning) return;
        
        isScanning = false;
        codeReader.reset(); // Menghentikan kamera
        scannerContainer.classList.remove('active');
        videoFeed.style.display = 'none';
        scannerMessage.style.display = 'block';
        scanButton.innerHTML = '<i class="fas fa-camera-retro"></i> SCAN';
        messageElement.textContent = 'Scanning dihentikan.';
    };

    // Fungsi untuk memulai scanner
    const startScanner = () => {
        isScanning = true;
        scannerContainer.classList.add('active');
        videoFeed.style.display = 'block';
        scannerMessage.style.display = 'none';
        scanButton.innerHTML = '<i class="fas fa-stop-circle"></i> STOP';
        messageElement.textContent = 'Mengaktifkan kamera... Arahkan ke barcode.';
        
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
                    // Tangani error lain selain 'Barcode tidak ditemukan'
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

        if (isScanning) {
            stopScanner();
        }

        const data = {
            lokasi: lokasiInput.value,    // Kolom A
            barcode: barcodeInput.value,  // Kolom B
            qty: qtyInput.value,          // Kolom C
            tanggal: tanggalInput.value   // Kolom D
        };

        if (!data.lokasi || !data.barcode || !data.qty) {
            messageElement.textContent = '❌ Harap isi semua kolom wajib.';
            messageElement.classList.add('show');
            setTimeout(() => { messageElement.classList.remove('show'); }, 3000);
            return;
        }

        messageElement.textContent = '⏳ Sedang menyimpan data...';
        messageElement.classList.add('show');

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(() => {
            // Asumsikan sukses jika fetch() tidak gagal karena mode 'no-cors'
            messageElement.textContent = '✅ Data berhasil disimpan ke Spreadsheet!';
            
            // Reset Formulir
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
