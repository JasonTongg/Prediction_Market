"use client";

import Link from "next/link";
import { Header } from "../components/header";
import { CreateMarketForm } from "../components/markets/create-market-form";

export default function CreateMarketPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-7 py-[34px] pb-[90px]">
        <Link
          href="/"
          className="hover-link-dark mb-[18px] inline-flex items-center gap-[7px] text-[13.5px] font-medium text-[#6E6E78]"
        >
          &larr; All markets
        </Link>

        <CreateMarketForm />
      </main>
    </div>
  );
}
