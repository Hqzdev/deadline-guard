"use client"; import { Bell, MapPin } from "lucide-react";
export default function AlertDemo({ mp }: { mp: "wb"|"ozon"|"both" }) {
  const shop = mp==="ozon"?"Ozon": mp==="wb"?"WB":"WB/Ozon";
  return (<div className="rounded-2xl border p-4 bg-white/80">
    <div className="flex items-center gap-2 text-slate-600 text-sm">
      <Bell size={18} className="text-[var(--brand)]" />
      <span className="font-medium">{shop}</span>
      <span>• заказ 308132 • дедлайн через</span>
      <span className="font-semibold text-slate-900">1 ч 20 мин</span>
    </div>
    <div className="mt-2 flex items-center gap-3 text-sm">
      <MapPin size={16} className="text-rose-500" />
      ПВЗ: Ленина, 5 (1,3 км) • потенциальный штраф <span className="font-medium text-rose-600">1,5%</span>
    </div>
    <div className="mt-3 flex flex-wrap gap-2 text-sm">
      <button className="px-3 py-1.5 rounded-xl border">Стикер</button>
      <button className="px-3 py-1.5 rounded-xl border">Курьер</button>
      <button className="px-3 py-1.5 rounded-xl border">Маршрут</button>
      <button className="px-3 py-1.5 rounded-xl border">Отложить 15 мин</button>
    </div>
    <p className="mt-2 text-xs text-slate-500">*Кнопки демонстрационные. Реальные действия подключим на следующих этапах.</p>
  </div>);
}
