import { redirect } from 'next/navigation';
import { auth } from '../auth.js';
export default async function Home() { const session = await auth(); redirect(session?.user ? '/dashboard' : '/login'); }
