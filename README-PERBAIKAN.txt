ARSITEKTUR

- tampil-stock-member.html adalah SATU halaman Tampil Stock Member. Produk dibaca langsung dari Google Spreadsheet Owner aktif. Tidak membaca koleksi stok Firebase.
- input-order-member.html membaca katalog dari Google Spreadsheet Owner aktif. Saat disimpan, order tetap masuk ke Firebase collection penjualan seperti alur original.
- approval-order-member.html dipertahankan dari original: approval membaca penjualan dan membuat order_member.
- reload-stock-member.html dipertahankan sebagai file original dan bukan sumber katalog untuk Tampil Stock Member/Input Order.
- Owner menyimpan sheetUrl pada users/{ownerUid}; URL tersebut disalin ke profil karyawan berdasarkan ownerUid/ownerId agar karyawan tidak perlu membaca dokumen Owner.
- Keranjang dipisahkan per Owner + akun login.
- Tidak ada tampil-stock-member-SPREADSHEET.html agar tidak ada dua halaman stok yang membingungkan.
