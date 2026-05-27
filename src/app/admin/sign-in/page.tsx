import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const { error, callbackUrl } = await searchParams;

  async function action(formData: FormData) {
    "use server";
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/admin",
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full bg-primary text-canvas font-mono text-[10px] font-semibold"
          >
            W
          </span>
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-structural/55">
            WSB · ADMIN
          </p>
        </div>

        <h1 className="font-sans text-2xl font-bold tracking-tight text-structural">
          관리자 로그인
        </h1>
        <p className="mt-2 text-sm text-structural/60">
          등록된 관리자 계정으로 로그인하세요.
        </p>

        <form action={action} className="mt-8 space-y-5">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

          <Field name="email" label="EMAIL" type="email" required />
          <Field name="password" label="PASSWORD" type="password" required />

          {error && (
            <p
              role="alert"
              className="border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700"
            >
              로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해 주세요.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-structural px-5 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-10 font-mono text-[10px] tracking-[0.08em] uppercase text-structural/35">
          NON-PUBLIC · INDEX BLOCKED
        </p>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  type,
  required,
}: {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}) {
  const id = `signin-${name}`;
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/65"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={type === "password" ? "current-password" : "email"}
        className="w-full border-0 border-b border-structural/25 bg-transparent px-0 py-2.5 text-sm text-structural focus:border-primary focus:outline-none focus:ring-0"
      />
    </div>
  );
}
