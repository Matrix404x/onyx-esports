import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function Register() {
  return (
    <AuthLayout
      title="Create Account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <Input label="Username" placeholder="gamer_tag" />
        <Input label="Email" type="email" placeholder="you@email.com" />
        <Input label="Password" type="password" placeholder="••••••••" />

        <button
          type="button"
          className="mt-4 bg-cyan-400 text-slate-900 font-semibold py-3 rounded-lg hover:opacity-90 transition"
        >
          Register
        </button>
      </form>
    </AuthLayout>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-slate-400">{label}</label>
      <input
        {...props}
        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
      />
    </div>
  );
}
