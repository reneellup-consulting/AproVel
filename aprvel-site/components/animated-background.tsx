"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating gradient orbs */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-float-orb" />
      <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-orb-reverse" />
      <div className="absolute top-[30%] right-[25%] w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-orb delay-300" />
      <div className="absolute bottom-[15%] left-[20%] w-80 h-80 bg-muted/40 rounded-full blur-3xl animate-float-orb-reverse delay-500" />
      <div className="absolute top-[75%] left-[60%] w-56 h-56 bg-primary/6 rounded-full blur-3xl animate-float-orb delay-700" />
    </div>
  )
}
