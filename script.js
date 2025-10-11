document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inventoryForm');
    const tanggalInput = document.getElementById('tanggal');
    const scanButton = document.getElementById('scanButton');
    const scannerContainer = document.getElementById('scanner-container');
    const barcodeInput = document.getElementById('barcode');
    const messageElement = document.getElementById('message');
    
    // 1. Set Tanggal Hari Ini secara Otomatis
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
    const dd = String(today.getDate()).padStart(2, '0');
    tanggalInput.value = `${yyyy}-${mm}-${dd}`;

    // 2. Barcode Scanning Placeholder Logic
    let isScanning = false;
    scanButton.addEventListener('click', () => {
        isScanning = !isScanning;
        scannerContainer.classList.toggle('active', isScanning);
        scanButton.innerHTML = isScanning 
            ? '<i class="fas fa-stop-circle"></i> STOP' 
            : '<i class="fas fa-camera-retro"></i>';

        if (isScanning) {
            // **PENTING: INTEGRASI BARCODE SCANNER DI SINI**
            // Di sini Anda perlu mengintegrasikan library pihak ketiga (misalnya: QuaggaJS)
            // untuk mengaktifkan kamera dan mulai scanning.
            // Contoh: Quagga.init({...}, (err) => { ... Quagga.start(); });

            // Placeholder: Simulasikan hasil scan setelah beberapa detik
            messageElement.textContent = 'Mulai scanning... arahkan kamera ke barcode.';
            setTimeout(() => {
                if(isScanning) {
                    const scannedCode = '8992745123456'; // Contoh hasil scan
                    barcodeInput.value = scannedCode;
                    isScanning = false;
                    scannerContainer.classList.remove('active');
                    scanButton.innerHTML = '<i class="fas fa-camera-retro"></i>';
                    messageElement.textContent = `Barcode ${scannedCode} berhasil di-scan!`;
                    
                    // Setelah scan berhasil, fokuskan ke Qty
                    document.getElementById('qty').focus();
                    
                    // **Catatan:** Dalam implementasi nyata, Anda akan memanggil Quagga.stop() di sini.
                }
            }, 3000); 

        } else {
            // Placeholder: Logika untuk menghentikan scanning
            // Contoh: Quagga.stop();
            messageElement.textContent = 'Scanning dihentikan.';
        }
    });


    // 3. Form Submission (Simpan Data ke Spreadsheet)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            lokasi: document.getElementById('lokasi').value, // Kolom A
            barcode: document.getElementById('barcode').value, // Kolom B
            qty: document.getElementById('qty').value, // Kolom C
            tanggal: document.getElementById('tanggal').value // Kolom D
        };

        console.log('Data yang akan dikirim:', data);
        
        // **PENTING: LOGIKA PENGIRIMAN DATA KE SPREADSHEET DI SINI**
        /*
        * Untuk menyimpan data ke spreadsheet (misalnya Google Sheets):
        * 1. Anda perlu membuat **Google Apps Script** sebagai API/Backend.
        * 2. Script ini akan menerima permintaan POST dengan data 'data' di atas.
        * 3. Script akan menulis data ke baris baru di Google Sheet.
        * * Contoh AJAX (Asynchronous JavaScript and XML) untuk mengirim data:
        
        const SCRIPT_URL = 'URL_APPS_SCRIPT_ANDA'; 
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(() => {
            messageElement.textContent = '✅ Data berhasil disimpan!';
            form.reset(); 
            tanggalInput.value = `${yyyy}-${mm}-${dd}`; // Set ulang tanggal
            document.getElementById('lokasi').focus(); // Fokus ke input pertama
            // Sembunyikan pesan setelah 3 detik
            setTimeout(() => { messageElement.textContent = ''; }, 3000);
        })
        .catch(error => {
            messageElement.textContent = '❌ Gagal menyimpan data: ' + error.message;
            console.error('Error:', error);
        });
        */

        // Placeholder Logika Sukses tanpa backend:
        messageElement.textContent = `✅ Data berhasil disimpan! Lokasi: ${data.lokasi}, Barcode: ${data.barcode}`;
        form.reset(); 
        tanggalInput.value = `${yyyy}-${mm}-${dd}`; // Set ulang tanggal
        document.getElementById('lokasi').focus();
        setTimeout(() => { messageElement.textContent = ''; }, 4000);
    });
});
