'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UsersRound, UserRound, ReceiptText, Clock3, ChartNoAxesCombined, WalletCards, LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
const items = [['/dashboard','Dashboard',LayoutDashboard],['/groups','Groups',UsersRound],['/members','Members',UserRound],['/contributions','Contributions',ReceiptText],['/payments','Payment history',Clock3],['/reports','Reports',ChartNoAxesCombined]];
export default function Sidebar({ name }) {
  const path = usePathname(); const [open, setOpen] = useState(false);
  return <><button aria-label="Open menu" onClick={()=>setOpen(!open)} className="fixed left-3 top-3 z-50 rounded-lg bg-slate-900 p-2 text-white md:hidden">{open?<X size={19}/>:<Menu size={19}/>}</button>{open&&<div onClick={()=>setOpen(false)} className="fixed inset-0 z-30 bg-black/30 md:hidden"/>}<aside className={`${open?'translate-x-0':'-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#172337] text-white transition-transform md:translate-x-0`}>
    <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6"><div className="rounded-xl bg-blue-500 p-2"><WalletCards size={21}/></div><div className="font-semibold leading-tight">Savings Group<br/><span className="text-sm font-normal text-slate-400">Manager</span></div></div>
    <div className="px-4 pt-7 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workspace</div><nav className="mt-3 flex-1 space-y-1 px-3">{items.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${path===href||path.startsWith(href+'/')?'bg-blue-600 text-white':'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={18}/>{label}</Link>)}</nav>
    <div className="border-t border-white/10 p-4"><div className="truncate px-2 pb-3 text-xs text-slate-400">Signed in as<br/><span className="mt-1 block truncate text-sm text-white">{name||'Administrator'}</span></div><button onClick={()=>signOut({callbackUrl:'/login'})} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10"><LogOut size={18}/>Log out</button></div></aside></>;
}
