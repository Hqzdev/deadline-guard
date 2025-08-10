import "./globals.css";
export const metadata = {
  title: "Deadline-Guard — ноль просрочек FBS (WB/Ozon)",
  description: "Проактивные уведомления и действия в один клик — чтобы не ловить штрафы и сохранять рейтинг.",
  icons: { icon: "/favicon.ico" }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ru"><body>{children}</body></html>);
}
