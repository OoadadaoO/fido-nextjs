import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-4 border-b border-border px-10 pb-4 font-sans text-2xl font-semibold">
        404 Not Found
      </h2>
      <div className="text-base">
        <span>Go to </span>
        <Link href="/" className="text-primary after:content-['_↗']">
          Home
        </Link>
      </div>
    </div>
  );
}
