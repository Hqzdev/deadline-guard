"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import { ArrowRight, Bell, Clock, ShieldCheck, Truck, CheckCircle2, Activity, Sparkles, Gift, Calculator, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import AlertDemo from "../components/AlertDemo";
import DeadlineGuardPro from "../components/DeadlineGuardPro";
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
const track=(n: string, p?: any)=>{
  try{
    // GA4 event
    window.gtag?.("event", n, {
      ...p,
      event_category: "engagement",
      event_label: n,
      value: 1
    });
  }catch(e){
    console.warn("GA4 tracking error:", e);
  }
  
  try{
    // Yandex Metrika goal
    if(window.ym && YM_ID) {
      window.ym(YM_ID, "reachGoal", n);
    }
  }catch(e){
    console.warn("YM tracking error:", e);
  }
  
  // Console log for debugging
  console.log("Track event:", n, p);
};
function shortUtm(){ try{ const raw=JSON.parse(localStorage.getItem("__utm")||"{}"); const src=raw.utm_source?.slice(0,8)||"src"; const cmp=raw.utm_campaign?.slice(0,10)||"cmp"; const md=raw.utm_medium?.slice(0,6)||"md"; const id=Math.random().toString(36).slice(2,8); return (`src_${src}|cmp_${cmp}|md_${md}|id_${id}`).slice(0,60);}catch{return "id_"+Math.random().toString(36).slice(2,8);}}
const tgLink=(tag: string)=>`https://t.me/${BOT_USERNAME.replace(/^@/,"")}?start=lead_${tag}_${shortUtm()}`;

export default function Landing(){
  const [mp,setMp]=useState<"both"|"wb"|"ozon">("both");
  useEffect(()=>{ 
    const url=new URL(window.location.href); 
    const utm=["utm_source","utm_medium","utm_campaign","utm_term","utm_content"]; 
    const obj: Record<string, string>={}; 
    utm.forEach(k=>{
      const v=url.searchParams.get(k); 
      if(v)obj[k]=v;
    }); 
    if(Object.keys(obj).length){ 
      localStorage.setItem("__utm",JSON.stringify(obj)); 
      track("utm_capture",obj);
    } 
    const mpParam=url.searchParams.get("mp"); 
    if(["wb","ozon","both"].includes(String(mpParam))) {
      setMp(String(mpParam) as "both"|"wb"|"ozon");
      track("marketplace_select", {marketplace: mpParam});
    }
    
    // Track page view
    track("page_view", {
      page_title: document.title,
      page_location: window.location.href,
      marketplace: mp
    });
  },[]);
  const data=[{month:"Янв",saved:1},{month:"Фев",saved:4},{month:"Мар",saved:9},{month:"Апр",saved:13},{month:"Май",saved:20},{month:"Июн",saved:28}];
  return (<main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800">
    <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);} window.gtag=gtag; gtag('js',new Date()); gtag('config','${GA4_ID}');`}</Script>
    <Script id="ym" strategy="afterInteractive">{`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date(); k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym'); if(window.ym) ym(${YM_ID},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}</Script>
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-2xl" style={{background:brand.primary}}/><span className="font-semibold text-slate-800">Deadline-Guard</span></div>
        <nav className="hidden md:flex gap-6 text-sm text-slate-600">
          <a href="#features" className="hover:text-slate-900">Возможности</a>
          <a href="#calc" className="hover:text-slate-900">Калькулятор</a>
          <a href="#bonus" className="hover:text-slate-900">Бонус</a>
          <a href="#pricing" className="hover:text-slate-900">Тарифы</a>
          <a href="#faq" className="hover:text-slate-900">FAQ</a>
          <a href="/deadline-guard" className="hover:text-slate-900 bg-indigo-100 px-3 py-1 rounded-lg">Deadline Guard Pro</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="rounded-xl">
            <a href={tgLink("header")} target="_blank" onClick={()=>{track("cta_click",{location:"header",action:"calculate"});track("hero_cta");}}>Рассчитать выгоду</a>
          </Button>
        </div>
      </div>
    </header>
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">Founders-100</div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mt-4">Ноль просрочек FBS на {mp=="wb"?"Wildberries":mp=="ozon"?"Ozon":"WB и Ozon"}</h1>
          <p className="mt-4 text-slate-600 text-lg">Уведомления заранее + действия в 1 клик. Экономим на штрафах и сохраняем рейтинг.</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm"><span className="text-slate-600">Маркетплейс:</span>
            {(["wb","ozon","both"] as const).map(x=>(<button key={x} onClick={()=>{setMp(x); track("marketplace_change", {marketplace: x});}} className={`px-3 py-1.5 rounded-xl border ${mp===x?"bg-[var(--brand)] text-white border-[var(--brand)]":"bg-white"}`}>{x=="wb"?"WB":x=="ozon"?"Ozon":"Оба"}</button>))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button asChild className="rounded-xl">
              <a href={tgLink("hero_calc")} target="_blank" onClick={()=>{track("cta_click",{location:"hero",action:"calculate"});track("cta_hero_calc");}}>
                Рассчитать окупаемость <ArrowRight className="ml-2" size={18}/>
              </a>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <a href={tgLink("hero")} target="_blank" onClick={()=>{track("cta_click",{location:"hero",action:"telegram"});track("cta_tg_click",{from:"hero"});}}>
                В Telegram за 90 секунд
              </a>
            </Button>
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

    
    {/* Deadline Guard Pro Section */}
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Deadline Guard Pro</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Полнофункциональное приложение для контроля остатков, мониторинга SKU и аналитики заказов
          </p>
        </div>
        <DeadlineGuardPro />
      </div>
    </section>
    <section id="bonus" className="py-16 bg-slate-50"><div className="max-w-6xl mx-auto px-4">
      <Card className="border-emerald-200"><CardHeader className="flex items-center gap-3"><Gift className="text-emerald-600" size={22}/><CardTitle>Бонус за 90 секунд в Telegram</CardTitle></CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6 items-center"><div className="text-slate-600">
        <ul className="list-disc ml-5 space-y-2"><li><b>Чек-лист PDF</b> «12 причин просрочек FBS и как их закрыть»</li><li><b>Скидка Founders-100</b>: 990 ₽/мес на 6 месяцев</li><li><b>Приоритетный доступ</b> в первую волну</li></ul></div>
        <div className="space-y-3"><Button asChild className="rounded-xl w-full"><a href={tgLink("bonus")} target="_blank" onClick={()=>{track("cta_click",{location:"bonus",action:"telegram"});track("cta_tg_click",{from:"bonus"});}}>Забрать бонус в Telegram <ArrowRight className="ml-2" size={16}/></a></Button>
        <p className="text-xs text-slate-500">Сначала отправим PDF, затем 5 коротких вопросов — ~90 секунд.</p></div></CardContent></Card></div></section>
    <section id="faq" className="py-16 bg-slate-50"><div className="max-w-6xl mx-auto px-4"><h2 className="text-2xl md:text-3xl font-bold mb-8">Вопросы и ответы</h2>
      <div className="grid md:grid-cols-2 gap-5 text-slate-700">
        <Card><CardHeader><CardTitle>Это законно?</CardTitle></CardHeader><CardContent>Да. Используем публичные API WB/Ozon, без плагинов в кабинете. Доступ можно отключить в 1 клик.</CardContent></Card>
        <Card><CardHeader><CardTitle>Нужны ли доступы к деньгам?</CardTitle></CardHeader><CardContent>Нет. Только чтение дедлайнов и статусов.</CardContent></Card>
      </div></div></section>
    <div className="fixed bottom-3 left-0 right-0 z-50 px-4 md:hidden"><a href={tgLink("sticky")} target="_blank" onClick={()=>{track("cta_click",{location:"sticky",action:"telegram"});track("sticky_cta");}} className="block text-center w-full px-4 py-3 rounded-xl text-white font-medium shadow-lg" style={{background:brand.primary}}>В Telegram за 90 секунд</a></div>
    <footer className="py-10 border-t bg-white mt-16"><div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6 items-center">
      <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-2xl" style={{background:brand.primary}}/><div><p className="font-semibold">Deadline-Guard</p><p className="text-sm text-slate-500">© {new Date().getFullYear()} Все права защищены</p></div></div>
      <div className="text-sm text-slate-500">Политика • Оферта • Реквизиты</div>
      <div className="flex gap-2 md:justify-end"><a className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-white hover:opacity-90" href={tgLink("footer_calc")} target="_blank" onClick={()=>{track("cta_click",{location:"footer",action:"calculate"});}} style={{background:brand.primary}}>Рассчитать выгоду</a>
      <a className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" href={tgLink("pricing")} target="_blank" onClick={()=>{track("cta_click",{location:"footer",action:"pricing"});}}>Тарифы</a></div></div></footer>
  </main>);
}
