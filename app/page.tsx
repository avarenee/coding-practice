import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/debounced-search">Debounced Search</Link>
      <Link href="/data-table">Data Table</Link>
    </div>
  );
}
