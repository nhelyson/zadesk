import { redirect } from 'next/navigation';

export default function WorkspaceCustomersRedirect() {
  redirect('/app/customers');
}
