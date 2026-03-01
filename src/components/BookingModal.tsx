import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, CreditCard, Check, Lock, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BookingCalendar from './BookingCalendar'
import { useAppStore } from '../store/AppStore'
import type { Photographer } from '../types'

const PACKAGES = {
  STANDARD: { label: 'Standard', desc: '2 giờ · 30 ảnh edited', price: (base: number) => base },
  PREMIUM: { label: 'Premium', desc: '4 giờ · 70 ảnh edited + album', price: (base: number) => Math.round(base * 1.6) },
  DELUXE: { label: 'Deluxe', desc: 'Full day · 150 ảnh + video', price: (base: number) => Math.round(base * 2.75) },
}

type Step = 'date' | 'package' | 'payment' | 'success'

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'date', label: 'Thời gian', icon: <Calendar className="h-4 w-4" /> },
  { key: 'package', label: 'Dịch vụ', icon: <ShieldCheck className="h-4 w-4" /> },
  { key: 'payment', label: 'Thanh toán', icon: <CreditCard className="h-4 w-4" /> },
]

export default function BookingModal({
  photographer,
  open,
  onClose,
}: {
  photographer: Photographer
  open: boolean
  onClose: () => void
}) {
  const { actions } = useAppStore()
  const nav = useNavigate()

  const [step, setStep] = useState<Step>('date')
  const [date, setDate] = useState('')
  const [pkg, setPkg] = useState<keyof typeof PACKAGES>('PREMIUM')
  const [card, setCard] = useState({ cardNumber: '', expiry: '', cvc: '' })
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const stepIdx = STEPS.findIndex((s) => s.key === step)
  const totalPrice = PACKAGES[pkg].price(photographer.startingPrice)

  function formatVnd(v: number) { return new Intl.NumberFormat('vi-VN').format(v) + ' ₫' }

  async function handlePay() {
    setError('')
    setPaying(true)
    try {
      await actions.createBooking({
        photographerId: photographer.id,
        date,
        packageTier: pkg,
        totalPrice,
        cardNumber: card.cardNumber,
        expiry: card.expiry,
        cvc: card.cvc,
      })
      setStep('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Thanh toán thất bại')
    } finally {
      setPaying(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-[32px] bg-white shadow-2xl"
          >
            {step === 'success' ? (
              <SuccessView photographer={photographer} date={date} pkg={pkg} totalPrice={totalPrice} onClose={() => {
                onClose()
                nav('/customer/bookings')
              }} />
            ) : (
              <>
                {/* Header */}
                <div className="relative border-b border-slate-100 bg-white px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-slate-900">Đặt lịch chụp ảnh</h2>
                      <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="text-indigo-600">●</span> {photographer.name}
                      </p>
                    </div>
                    <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-between bg-slate-50/50 px-8 py-4 border-b border-slate-100/60">
                  {STEPS.map((s, i) => (
                    <div key={s.key} className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black transition-all ${i < stepIdx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' :
                        i === stepIdx ? 'bg-slate-900 text-white' :
                          'bg-slate-200 text-slate-400'
                        }`}>
                        {i < stepIdx ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${i === stepIdx ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                      {i < STEPS.length - 1 && <div className="ml-2 h-1 w-1 rounded-full bg-slate-200" />}
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div className="max-h-[65vh] overflow-y-auto px-8 py-8 scrollbar-hide">
                  <AnimatePresence mode="wait">
                    {step === 'date' && (
                      <motion.div key="date" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                        <div className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Bước 1: Chọn ngày</div>
                        <BookingCalendar value={date} onChange={setDate} busyDates={photographer.busyDates} />
                        <button
                          disabled={!date}
                          onClick={() => setStep('package')}
                          className={`mt-6 flex h-14 w-full items-center justify-center rounded-2xl text-sm font-black text-white shadow-xl transition-all active:scale-[0.98] ${date ? 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'}`}
                        >
                          Tiếp theo
                        </button>
                      </motion.div>
                    )}

                    {step === 'package' && (
                      <motion.div key="package" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                        <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">Bước 2: Chọn gói</div>
                        {(Object.entries(PACKAGES) as [keyof typeof PACKAGES, typeof PACKAGES[keyof typeof PACKAGES]][]).map(([key, info]) => {
                          const price = info.price(photographer.startingPrice)
                          const selected = pkg === key
                          return (
                            <button key={key} onClick={() => setPkg(key)}
                              className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all ${selected ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className={`text-sm font-black ${selected ? 'text-indigo-900' : 'text-slate-900'}`}>{info.label}</div>
                                  <div className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">{info.desc}</div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-black ${selected ? 'text-indigo-700' : 'text-slate-900'}`}>{formatVnd(price)}</div>
                                  <div className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Trả trước 100%</div>
                                </div>
                              </div>
                              {selected && <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-600 [clip-path:polygon(100%_0,0_0,100%_100%)] flex items-start justify-end p-1.5"><Check className="h-3 w-3 text-white" /></div>}
                            </button>
                          )
                        })}

                        <button onClick={() => setStep('payment')}
                          className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                          Thanh toán {formatVnd(PACKAGES[pkg].price(photographer.startingPrice))}
                        </button>
                        <button onClick={() => setStep('date')} className="w-full text-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition">← Quay lại</button>
                      </motion.div>
                    )}

                    {step === 'payment' && (
                      <motion.div key="payment" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400">Bước 3: Chi tiết thanh toán</div>

                        <div className="space-y-4">
                          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-inset ring-slate-100">
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-slate-500">Gói {PACKAGES[pkg].label}</span>
                              <span className="font-black text-slate-900">{formatVnd(totalPrice)}</span>
                            </div>
                            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Dịch vụ Escrow bảo đảm</span>
                                <span className="text-emerald-500 flex items-center gap-1"><Check className="h-3 w-3" /> MIỄN PHÍ</span>
                              </div>
                              <div className="flex justify-between items-center text-[15px] font-black text-indigo-700">
                                <span>Tổng tiền cọc</span>
                                <span>{formatVnd(totalPrice)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Field label="SỐ THẺ">
                              <input value={card.cardNumber} onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                                placeholder="4242 4242 4242 4242"
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none ring-indigo-500/10 transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="NGÀY HẾT HẠN">
                                <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                                  placeholder="12 / 27"
                                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none ring-indigo-500/10 transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4" />
                              </Field>
                              <Field label="MÃ CVC">
                                <input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                                  placeholder="123"
                                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none ring-indigo-500/10 transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4" />
                              </Field>
                            </div>
                          </div>
                        </div>

                        {error && <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-600 italic">✕ {error}</div>}

                        <button onClick={handlePay} disabled={paying}
                          className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black text-white shadow-xl transition-all active:scale-[0.98] ${paying ? 'bg-slate-400 shadow-none' : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700'}`}>
                          {paying ? <>
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ĐANG XỬ LÝ...
                          </> : <><Lock className="h-4.2 w-4.2" /> KHỞI TẠO ESCROW</>}
                        </button>
                        <button onClick={() => setStep('package')} className="w-full text-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition">← BƯỚC TRƯỚC</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function SuccessView({ photographer, date, pkg, totalPrice, onClose }: {
  photographer: Photographer; date: string; pkg: keyof typeof PACKAGES; totalPrice: number; onClose: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-10 py-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-100 shadow-lg shadow-emerald-500/10">
        <Check className="h-10 w-10 text-emerald-600" />
      </div>
      <h2 className="mt-8 text-2xl font-black tracking-tight text-slate-900">Tuyệt vời! 🔥</h2>
      <p className="mt-4 text-[13px] font-medium leading-relaxed text-slate-500 px-2">
        Đơn đặt lịch của bạn đã được khởi tạo. Tiền đã được giữ an toàn trên <strong>PhotoMarket Escrow</strong>.
      </p>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50 p-1">
        <div className="bg-white rounded-[20px] p-5 text-sm text-left space-y-3 shadow-sm ring-1 ring-slate-100">
          <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Nhiếp ảnh gia</span><span className="font-black text-slate-900">{photographer.name}</span></div>
          <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Gói dịch vụ</span><span className="font-black text-indigo-600">{PACKAGES[pkg].label}</span></div>
          <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Ngày chụp</span><span className="font-black text-slate-900">{new Date(date + 'T00:00:00').toLocaleDateString('vi-VN', { dateStyle: 'long' })}</span></div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="font-black text-slate-900">Đã thanh toán</span>
            <span className="text-xl font-black text-indigo-700">{new Intl.NumberFormat('vi-VN').format(totalPrice)}₫</span>
          </div>
        </div>
      </div>

      <button onClick={onClose} className="mt-10 w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98]">
        QUẢN LÝ BOOKING CỦA TÔI
      </button>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</span>
      {children}
    </label>
  )
}
