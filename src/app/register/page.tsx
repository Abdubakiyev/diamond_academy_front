import { Suspense } from 'react';
import AuthShell from '../../components/auth/AuthShell';
import AuthForm from '../../components/auth/AuthForm';

export const metadata = { title: 'Kirish · Diamond Academy' };

export default function RegisterPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    </AuthShell>
  );
}
