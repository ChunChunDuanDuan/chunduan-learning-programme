import { LoginForm } from "../../components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-neutral-500">Authentication</p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          Login
        </h2>

        <p className="mt-3 max-w-2xl text-neutral-600">
          Sign in to sync your learning records across Windows, iPad, and
          iPhone.
        </p>
      </section>

      <LoginForm />
    </div>
  );
}