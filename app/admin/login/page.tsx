export const metadata = {
  title: "Admin login",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="/">
          HIDE2HUMAN
        </a>
        <p className="eyebrow">Admin</p>
      </header>

      <main>
        <section className="intro" aria-labelledby="admin-login-title">
          <p className="kicker">Restricted area</p>
          <h1 id="admin-login-title">Admin login</h1>
          <p>Sign in to review and moderate submitted traces.</p>
          <AdminLoginForm />
        </section>
      </main>
    </div>
  );
}
import { AdminLoginForm } from "@/app/components/admin-login-form";
