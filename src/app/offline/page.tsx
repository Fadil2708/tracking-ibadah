import Link from 'next/link';

export default function Offline() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-teal-100 rounded-full">
          <svg
            className="w-12 h-12 text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728M12 12h.01M7.05 7.05a9 9 0 000 9.9M16.95 16.95a9 9 0 000-9.9"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3l18 18"
              className="text-red-500"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Kamu Offline</h1>
        <p className="text-gray-600 mb-8">
          Tidak ada koneksi internet. Beberapa fitur mungkin tidak berfungsi.
        </p>

        <div className="space-y-4">
          {/* Cached Data Notice */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-start gap-3 text-left">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Data Tersimpan</h3>
                <p className="text-sm text-gray-600">
                  Data ibadah yang sudah tersimpan masih bisa diakses. Perubahan akan disinkronkan saat online kembali.
                </p>
              </div>
            </div>
          </div>

          {/* What you can do */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 text-left">Yang bisa dilakukan:</h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Menambah catatan ibadah (akan disinkronkan nanti)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Melihat riwayat ibadah yang sudah tersimpan</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Menghitung dzikir & sholawat</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Retry Connection */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Koneksi akan otomatis pulih saat perangkat terhubung ke internet
        </p>
      </div>
    </div>
  );
}
