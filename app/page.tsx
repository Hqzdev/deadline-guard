"use client";
import React, { useMemo, useState, useEffect } from "react";
import Script from "next/script";
import { ArrowRight, Bell, Clock, ShieldCheck, Truck, CheckCircle2, Activity, Sparkles, Calculator, BadgePercent, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import AlertDemo from "../components/AlertDemo";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (id: number, action: string, goal: string) => void;
  }
}
const BOT_USERNAME = "deadline_guard_bot";
const GA4_ID = "G-500412522";
const YM_ID = 103653140; const brand={ primary:"#4F46E5" };
const track=(n: string, p?: any)=>{ try{window.gtag?.("event",n,p||{})}catch{}; try{window.ym&&YM_ID&&window.ym(YM_ID,"reachGoal",n)}catch{};};
function shortUtm(){ try{ const raw=JSON.parse(localStorage.getItem("__utm")||"{}"); const src=raw.utm_source?.slice(0,8)||"src"; const cmp=raw.utm_campaign?.slice(0,10)||"cmp"; const md=raw.utm_medium?.slice(0,6)||"md"; const id=Math.random().toString(36).slice(2,8); return (`src_${src}|cmp_${cmp}|md_${md}|id_${id}`).slice(0,60);}catch{return "id_"+Math.random().toString(36).slice(2,8);}}
const tgLink=(tag: string)=>`https://t.me/${BOT_USERNAME.replace(/^@/,"")}?start=lead_${tag}_${shortUtm()}`;
function RoiCalculator(){
  const [orders,setOrders]=useState(300); const [lateRate,setLateRate]=useState(3); const [reducePct,setReducePct]=useState(60);
  const [margin,setMargin]=useState(400); const [penalty,setPenalty]=useState(300); const [plan,setPlan]=useState("starter");
  const priceMap: Record<string, number>={starter:990, pro:2990, biz:4990};
  const {lateOrders,savedOrders,savingRub,roi,paybackDays}=useMemo(()=>{ const lateOrders=Math.max(0,Math.round((orders*lateRate)/100));
    const savedOrders=Math.round(lateOrders*(reducePct/100)); const savingRub=Math.round(savedOrders*(margin+penalty));
    const price=priceMap[plan]; const roi=price>0?Math.round((savingRub/price)*100):0; const paybackDays=price>0?Math.max(1,Math.ceil((price/Math.max(1,savingRub))*30)):0;
    return {lateOrders,savedOrders,savingRub,roi,paybackDays}; },[orders,lateRate,reducePct,margin,penalty,plan]);
  return (<div id="calc"><Card className="border-slate-200">
    <CardHeader className="pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-indigo-50 text-indigo-700"><Calculator size={22}/></div><CardTitle className="text-xl">Калькулятор окупаемости</CardTitle></div>
      <div className="flex items-center gap-2 text-xs text-slate-500"><BadgePercent size={16}/>Обычно снижаем просрочки ≈ на 60% (оценка)</div>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className="text-sm text-slate-600">Заказы FBS в месяц</label><input type="number" min={0} value={orders} onChange={e=>setOrders(Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-slate-600">Просрочки без нас, %</label><input type="number" min={0} step={0.5} value={lateRate} onChange={e=>setLateRate(Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"/></div>
            <div><label className="text-sm text-slate-600">Снижение просрочек, %</label><input type="number" min={0} max={100} step={5} value={reducePct} onChange={e=>setReducePct(Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-slate-600">Маржа/заказ, ₽</label><input type="number" min={0} step={10} value={margin} onChange={e=>setMargin(Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"/></div>
            <div><label className="text-sm text-slate-600">Штраф/издержки за просрочку, ₽</label><input type="number" min={0} step={10} value={penalty} onChange={e=>setPenalty(Number(e.target.value))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"/></div>
          </div>
          <div><label className="text-sm text-slate-600">Тариф</label><div className="mt-2 flex gap-2">{["starter","pro","biz"].map(p=>(
            <button key={p} onClick={()=>setPlan(p)} className={`px-3 py-2 rounded-xl text-sm border ${plan===p?"bg-[var(--brand)] text-white border-[var(--brand)]":"bg-white hover:bg-slate-50"}`}>{p=="starter"?"Starter (990)":p=="pro"?"Pro (2 990)":"Business (4 990)"}</button>
          ))}</div></div>
          <div><Button className="rounded-xl" href={tgLink("calc_submit")} target="_blank" onClick={()=>track("calc_submit",{orders,lateRate,reducePct,margin,penalty,plan})}>Рассчитать окупаемость <ArrowRight className="ml-2" size={16}/></Button></div>
        </div>
        <div className="grid gap-4 content-start">
          <div className="p-4 rounded-2xl border bg-white/80"><p className="text-slate-500 text-sm">Просрочек без нас (в мес)</p><p className="text-2xl font-bold">{lateOrders}</p></div>
          <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200"><p className="text-emerald-700 text-sm">Спасём заказов в месяц</p><p className="text-2xl font-bold text-emerald-800">{savedOrders}</p></div>
          <div className="p-4 rounded-2xl border bg-indigo-50 border-indigo-200"><p className="text-indigo-700 text-sm">Экономия в месяц</p><p className="text-2xl font-bold text-indigo-900">{savingRub.toLocaleString("ru-RU")} ₽</p></div>
          <div className="p-4 rounded-2xl border bg-orange-50 border-orange-200"><p className="text-orange-700 text-sm">Окупаемость тарифа (ROI)</p><p className="text-xl font-semibold text-orange-800">{roi} % • Окупится примерно за {paybackDays} дн.</p></div>
          <Button className="rounded-xl" href={tgLink("calc")} target="_blank" onClick={()=>track("cta_tg_click",{from:"calc"})}>Перейти в Telegram <ArrowRight className="ml-2" size={16}/></Button>
          <p className="text-xs text-slate-500">Это оценка: точные цифры зависят от ваших показателей.</p>
        </div>
      </div>
    </CardContent></Card></div>);
}
export default function Landing(){
  const [mp,setMp]=useState<"both"|"wb"|"ozon">("both");
  useEffect(()=>{ const url=new URL(window.location.href); const utm=["utm_source","utm_medium","utm_campaign","utm_term","utm_content"]; const obj: Record<string, string>={}; utm.forEach(k=>{const v=url.searchParams.get(k); if(v)obj[k]=v;}); if(Object.keys(obj).length){ localStorage.setItem("__utm",JSON.stringify(obj)); track("utm_capture",obj);} const mpParam=url.searchParams.get("mp"); if(["wb","ozon","both"].includes(String(mpParam))) setMp(String(mpParam) as "both"|"wb"|"ozon"); },[]);
  const data=[{month:"Янв",saved:1},{month:"Фев",saved:4},{month:"Мар",saved:9},{month:"Апр",saved:13},{month:"Май",saved:20},{month:"Июн",saved:28}];
  return (<main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800">
    <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);} window.gtag=gtag; gtag('js',new Date()); gtag('config','${GA4_ID}');`}</Script>
    <Script id="ym" strategy="afterInteractive">{`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date(); k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym'); if(window.ym) ym(${YM_ID},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}</Script>
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-2xl" style={{background:brand.primary}}/><span className="font-semibold text-slate-800">Deadline-Guard</span></div>
        <nav className="hidden md:flex gap-6 text-sm text-slate-600"><a href="#features" className="hover:text-slate-900">Возможности</a><a href="#calc" className="hover:text-slate-900">Калькулятор</a><a href="#bonus" className="hover:text-slate-900">Бонус</a><a href="#pricing" className="hover:text-slate-900">Тарифы</a><a href="#faq" className="hover:text-slate-900">FAQ</a></nav>
        <div className="flex items-center gap-2"><Button className="rounded-xl" href={tgLink("header")} target="_blank" onClick={()=>track("hero_cta")}>Рассчитать выгоду</Button></div>
      </div>
    </header>
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">Founders-100</div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mt-4">Ноль просрочек FBS на {mp=="wb"?"Wildberries":mp=="ozon"?"Ozon":"WB и Ozon"}</h1>
          <p className="mt-4 text-slate-600 text-lg">Уведомления заранее + действия в 1 клик. Экономим на штрафах и сохраняем рейтинг.</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm"><span className="text-slate-600">Маркетплейс:</span>
            {(["wb","ozon","both"] as const).map(x=>(<button key={x} onClick={()=>setMp(x)} className={`px-3 py-1.5 rounded-xl border ${mp===x?"bg-[var(--brand)] text-white border-[var(--brand)]":"bg-white"}`}>{x=="wb"?"WB":x=="ozon"?"Ozon":"Оба"}</button>))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button className="rounded-xl" href={tgLink("hero_calc")} target="_blank" onClick={()=>track("cta_hero_calc")}>Рассчитать окупаемость <ArrowRight className="ml-2" size={18}/></Button>
            <Button variant="secondary" className="rounded-xl" href={tgLink("hero")} target="_blank" onClick={()=>track("cta_tg_click",{from:"hero"})}>В Telegram за 90 секунд</Button>
          </div>
          <div className="mt-6 flex items-center gap-5 text-sm text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-600"/> Официальные API</div>
            <div className="flex items-center gap-2"><Clock size={16} className="text-indigo-600"/> −4ч / −2ч / −60мин</div>
            <div className="flex items-center gap-2"><Truck size={16} className="text-orange-600"/> Курьер/ПВЗ — подключим позже</div>
          </div>
        </div>
        <Card className="shadow-xl border-slate-100">
          <CardHeader><CardTitle className="text-xl">Экономия на штрафах — растущая кривая</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={brand.primary} stopOpacity={0.6}/><stop offset="100%" stopColor={brand.primary} stopOpacity={0.05}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fill: "#475569" }} /><YAxis tick={{ fill: "#475569" }} /><Tooltip />
                  <Area type="monotone" dataKey="saved" stroke={brand.primary} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-slate-500 mt-3">Иллюстрация. Реальные цифры — в отчёте /summary.</p>
          </CardContent>
        </Card>
      </div>
    </section>
    <section className="py-6"><div className="max-w-6xl mx-auto px-4"><AlertDemo mp={mp}/></div></section>
    <section id="features" className="py-16 bg-white"><div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Что умеет Deadline-Guard</h2>
      <div className="grid md:grid-cols-3 gap-5">
        <Card><CardHeader className="flex items-center gap-3 pb-2"><Bell className="text-indigo-600" size={22}/><CardTitle>Проактивные уведомления</CardTitle></CardHeader><CardContent>Пинги за 4 часа, 2 часа и 60 минут до дедлайна. Без спама и дублей.</CardContent></Card>
        <Card><CardHeader className="flex items-center gap-3 pb-2"><Activity className="text-indigo-600" size={22}/><CardTitle>Приоритет по риску</CardTitle></CardHeader><CardContent>Критично / важно / можно позже — с учётом упаковки и дороги.</CardContent></Card>
        <Card><CardHeader className="flex items-center gap-3 pb-2"><ShieldCheck className="text-indigo-600" size={22}/><CardTitle>Официальные интеграции</CardTitle></CardHeader><CardContent>Только открытые API WB и Ozon. Ключи у вас, можно отключить в 1 клик.</CardContent></Card>
      </div></div></section>
    <section id="bonus" className="py-16 bg-slate-50"><div className="max-w-6xl mx-auto px-4">
      <Card className="border-emerald-200"><CardHeader className="flex items-center gap-3"><Gift className="text-emerald-600" size={22}/><CardTitle>Бонус за 90 секунд в Telegram</CardTitle></CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6 items-center"><div className="text-slate-600">
        <ul className="list-disc ml-5 space-y-2"><li><b>Чек-лист PDF</b> «12 причин просрочек FBS и как их закрыть»</li><li><b>Скидка Founders-100</b>: 990 ₽/мес на 6 месяцев</li><li><b>Приоритетный доступ</b> в первую волну</li></ul></div>
        <div className="space-y-3"><Button className="rounded-xl w-full" href={tgLink("bonus")} target="_blank" onClick={()=>track("cta_tg_click",{from:"bonus"})}>Забрать бонус в Telegram <ArrowRight className="ml-2" size={16}/></Button>
        <p className="text-xs text-slate-500">Сначала отправим PDF, затем 5 коротких вопросов — ~90 секунд.</p></div></CardContent></Card></div></section>
    <section id="faq" className="py-16 bg-slate-50"><div className="max-w-6xl mx-auto px-4"><h2 className="text-2xl md:text-3xl font-bold mb-8">Вопросы и ответы</h2>
      <div className="grid md:grid-cols-2 gap-5 text-slate-700">
        <Card><CardHeader><CardTitle>Это законно?</CardTitle></CardHeader><CardContent>Да. Используем публичные API WB/Ozon, без плагинов в кабинете. Доступ можно отключить в 1 клик.</CardContent></Card>
        <Card><CardHeader><CardTitle>Нужны ли доступы к деньгам?</CardTitle></CardHeader><CardContent>Нет. Только чтение дедлайнов и статусов.</CardContent></Card>
      </div></div></section>
    <div className="fixed bottom-3 left-0 right-0 z-50 px-4 md:hidden"><a href={tgLink("sticky")} target="_blank" onClick={()=>track("sticky_cta")} className="block text-center w-full px-4 py-3 rounded-xl text-white font-medium shadow-lg" style={{background:brand.primary}}>В Telegram за 90 секунд</a></div>
    <footer className="py-10 border-t bg-white mt-16"><div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6 items-center">
      <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-2xl" style={{background:brand.primary}}/><div><p className="font-semibold">Deadline-Guard</p><p className="text-sm text-slate-500">© {new Date().getFullYear()} Все права защищены</p></div></div>
      <div className="text-sm text-slate-500">Политика • Оферта • Реквизиты</div>
      <div className="flex gap-2 md:justify-end"><a className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-white hover:opacity-90" href={tgLink("footer_calc")} target="_blank" style={{background:brand.primary}}>Рассчитать выгоду</a>
      <a className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" href={tgLink("pricing")} target="_blank">Тарифы</a></div></div></footer>
  </main>);
}
