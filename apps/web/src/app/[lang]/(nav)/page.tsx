const features = [
  {
    title: "What you know",
    description:
      "Securely authenticate using a PIN with Windows Hello integration.",
  },
  {
    title: "What you have",
    description:
      "Securely authenticate using a hardware security key, such as a YubiKey.",
  },
  {
    title: "Who you are",
    description:
      "Securely authenticate using biometric recognition, such as fingerprint or facial recognition.",
  },
  {
    title: "Trust Platform Module",
    description:
      "Hardware-based security chip that securely stores passkeys and performs cryptographic operations privately.",
  },
  {
    title: "Passkey Management",
    description:
      "Effortlessly manage your passkeys and related sessions for enhanced security.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-6 px-6 py-12">
      <section className="py-20 text-center">
        <h1 className="mb-8 grid gap-y-2 text-3xl font-bold tracking-tight text-foreground">
          Welcome to Our FIDO2 Authentication Demo
          <span className="block font-mono text-6xl font-bold tracking-wider">
            FIDOG!
          </span>
        </h1>
        <div className="mb-8 grid gap-y-1 text-lg text-muted-foreground">
          <p>
            Are you in search of a more secure and convenient way of
            authentication?
          </p>
          <p>
            FIDO Authentication is the robust ,seamless, and secure solution
            you've been looking for!
          </p>
        </div>
        <a
          href="#"
          className="inline-block rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground transition duration-300 hover:bg-primary/80"
        >
          Start Demo
        </a>
      </section>

      <section className="relative rounded-2xl p-4 text-center">
        <div className="absolute -inset-3 bg-muted/80 blur-2xl" />
        <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group select-none rounded-2xl bg-background p-6 shadow-sm shadow-muted-foreground/40 transition-transform hover:scale-[1.02] hover:cursor-pointer ${i === features.length - 1 && i % 2 === 0 ? "md:col-span-2" : ""}`}
            >
              <h3 className="mb-3 text-lg font-semibold text-foreground transition-transform group-hover:scale-105">
                {feature.title}
              </h3>
              <p className="text-muted-foreground transition-transform group-hover:scale-105">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
