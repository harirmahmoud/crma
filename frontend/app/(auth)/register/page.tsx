import { SignUp } from "@clerk/nextjs"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card shadow-lg",
          },
        }}
        routing="path"
        path="/register"
        signInUrl="/login"
        redirectUrl="/dashboard"
      />
    </div>
  )
}
