import { redirect } from 'next/navigation';

export default function WorkspaceConversationsRedirect() {
  redirect('/app/conversations');
}
