import { auth } from '../auth.js';
import { redirect } from 'next/navigation';
import Sidebar from './Sidebar';
export default async function Shell({ children }) { const session=await auth(); if(!session?.user) redirect('/login'); return <div><Sidebar name={session.user.name}/><main className="min-h-screen px-4 pb-10 pt-16 md:ml-64 md:px-8 md:pt-8"><div className="mx-auto max-w-7xl">{children}</div></main></div>; }
