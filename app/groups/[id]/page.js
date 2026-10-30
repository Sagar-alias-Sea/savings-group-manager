import Shell from '../../../components/Shell.js';
import { GroupDetail } from '../../../components/Manager.js';
export default async function Page({params}){const {id}=await params;return <Shell><GroupDetail id={id}/></Shell>}
