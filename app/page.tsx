import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full m-4 flex flex-col align-center justify-center space-y-2">
      <Link href="/debounced-search">Debounced Search</Link>
      <Link href="/data-table">Data Table</Link>
      <Link href="/form-validation">Form Validation</Link>
    </div>
  );
}
