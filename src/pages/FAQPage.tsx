import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircle, HelpCircle, ShieldCheck } from 'lucide-react'
import { useAppStore } from '../store/AppStore'

const faqs = [
  {
    category: 'Thanh toán & Đặt cọc',
    icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
    items: [
      {
        q: 'Tiền cọc của tôi được giữ như thế nào?',
        a: 'PhotoMarket sử dụng hệ thống Escrow an toàn. Tiền cọc (30%) của bạn sẽ được nền tảng giữ lại và chỉ chuyển cho Nhiếp ảnh gia sau khi bộ ảnh được giao thành công hoặc khi bạn xác nhận hoàn tất dịch vụ.'
      },
      {
        q: 'Tôi muốn hủy lịch, có được hoàn cọc không?',
        a: 'Tùy thuộc vào chính sách của từng photographer và thời điểm báo hủy. Thông thường, nếu báo trước 7 ngày, bạn sẽ được hoàn 100%. Nếu sát ngày, cọc có thể không được hoàn lại. Vui lòng xem kỹ "Chính sách hủy" của mỗi gói chụp.'
      }
    ]
  },
  {
    category: 'Giao nhận ảnh',
    icon: <MessageCircle className="h-5 w-5 text-indigo-500" />,
    items: [
      {
        q: 'Tôi sẽ nhận ảnh qua đâu?',
        a: 'Sau khi chụp xong, Nhiếp ảnh gia sẽ tải ảnh lên hệ thống PhotoMarket. Bạn có thể xem trước hình ảnh (có watermark). Sau khi thanh toán phần còn lại, hệ thống sẽ mở khóa link tải ảnh gốc chất lượng cao cho bạn.'
      },
      {
        q: 'Photographer giao ảnh trễ hạn thì sao?',
        a: 'Bạn có quyền tạo yêu cầu "Khiếu nại (Dispute)" trong phần quản lý Booking. Admin của hệ thống sẽ kiểm tra log làm việc và có thể hoàn một phần hoặc toàn bộ số tiền tùy theo mức độ trễ hạn.'
      }
    ]
  },
  {
    category: 'Photographer',
    icon: <HelpCircle className="h-5 w-5 text-amber-500" />,
    items: [
      {
        q: 'Bao lâu thì tôi nhận được tiền từ hệ thống?',
        a: 'Sau khi Khách hàng bấm "Hoàn tất" hoặc sau 48h kể từ khi giao ảnh mà khách không phản hồi, hệ thống sẽ tự động chuyển trạng thái hoàn thành. Tiền sẽ về "Ví tiền (Wallet)" của bạn ngay lập tức. Sau đó bạn có thể rút về tài khoản ngân hàng.'
      },
      {
        q: 'Tôi có thể thay đổi giá các gói chụp không?',
        a: 'Bạn hoàn toàn có thể cập nhật giá và chi tiết gói chụp (Photoset) trong phần Quản lý Portfolio. Tuy nhiên, các giá này sẽ chỉ áp dụng cho những booking mới. Những booking đã lên lịch sẽ giữ nguyên giá cũ.'
      }
    ]
  }
]

export default function FAQPage() {
  const { state } = useAppStore()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Câu hỏi thường gặp</h1>
        <p className="mt-4 text-slate-500">Mọi thông tin bạn cần biết về quy trình làm việc giữa Khách hàng và Nhiếp ảnh gia.</p>
      </div>

      <div className="space-y-8">
        {faqs.map((category, cIdx) => (
          <div key={cIdx} className="space-y-4">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                {category.icon}
              </span>
              {category.category}
            </h2>
            
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              {category.items.map((item, iIdx) => {
                const id = `${cIdx}-${iIdx}`
                const isOpen = openItems[id]

                return (
                  <div key={iIdx} className="border-b border-slate-100 last:border-0">
                    <button
                      onClick={() => toggleItem(id)}
                      className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50"
                    >
                      <span className="font-bold text-slate-900">{item.q}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-indigo-500' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pt-0 text-sm leading-relaxed text-slate-600">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-indigo-600 p-8 text-center text-white shadow-xl shadow-indigo-600/20">
        <h2 className="mb-3 text-xl font-black">Bạn vẫn chưa tìm được giải đáp?</h2>
        <p className="mb-6 mx-auto max-w-lg text-indigo-100">
          Hãy liên hệ trực tiếp với bộ phận hỗ trợ của chúng tôi, hoặc mở yêu cầu khiếu nại nếu bạn đang gặp vấn đề với đơn đặt lịch.
        </p>
        <button className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-600 shadow-lg shadow-white/20 transition-all hover:bg-indigo-50 active:scale-95">
          Gửi yêu cầu hỗ trợ
        </button>
      </div>
    </div>
  )
}
