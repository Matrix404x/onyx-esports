export default function AuthLayout({ title, children, footer }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">
          {title}
        </h1>
        <p className="text-slate-400 mb-6">
          Welcome back. Let’s get you in.
        </p>

        {children}

        {footer && (
          <div className="mt-6 text-sm text-slate-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
