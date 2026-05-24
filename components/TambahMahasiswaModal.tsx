'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const EMPTY_FORM = {
  full_name: '',
  nim: '',
  email: '',
  password: '',
  confirm_password: '',
  phone: '',
  faculty: '',
  major: '',
  year_entry: '',
  student_status: 'active',
}

export default function TambahMahasiswaModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const set = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.full_name || !form.nim || !form.email || !form.password || !form.major || !form.year_entry) {
      setError('Harap lengkapi semua field yang wajib diisi.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/mahasiswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          nim: form.nim,
          phone: form.phone || undefined,
          faculty: form.faculty || undefined,
          major: form.major,
          year_entry: form.year_entry ? Number(form.year_entry) : undefined,
          student_status: form.student_status,
          role: 'student',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Gagal menambahkan mahasiswa.')
        return
      }

      onSuccess()
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">Tambah Mahasiswa</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Data akan langsung aktif untuk login di aplikasi</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form id="tambah-mahasiswa-form" onSubmit={handleSubmit} className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={set('full_name')}
                placeholder="Contoh: Siti Nurhaliza"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                disabled={loading}
              />
            </div>

            {/* NIM */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                NIM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nim}
                onChange={(e) => setForm((p) => ({ ...p, nim: e.target.value.replace(/\D/g, '') }))}
                placeholder="2022110001"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] font-mono"
                disabled={loading}
              />
            </div>

            {/* Angkatan */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Angkatan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.year_entry}
                onChange={set('year_entry')}
                placeholder="2022"
                min="2000"
                max="2099"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="siti@kampus.ac.id"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                disabled={loading}
              />
            </div>

            {/* No. Telepon */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                No. Telepon
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={set('phone')}
                placeholder="08123456789"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 8 karakter"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                disabled={loading}
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={set('confirm_password')}
                placeholder="Ulangi password"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                disabled={loading}
              />
            </div>

            {/* Program Studi */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Program Studi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.major}
                onChange={set('major')}
                placeholder="Teknik Informatika"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                disabled={loading}
              />
            </div>

            {/* Fakultas */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Fakultas
              </label>
              <input
                type="text"
                value={form.faculty}
                onChange={set('faculty')}
                placeholder="Fakultas Teknik"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Status Mahasiswa
              </label>
              <select
                value={form.student_status}
                onChange={set('student_status')}
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] bg-white"
                disabled={loading}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Non-aktif</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-[#374151] border border-[#d1d5db] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="tambah-mahasiswa-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1e3a5f] rounded-lg hover:bg-[#16304f] transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Menyimpan...' : 'Tambah Mahasiswa'}
          </button>
        </div>
      </div>
    </div>
  )
}
