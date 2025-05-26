// src/app/page.tsx
import Link from "next/link";
import { useState } from 'react';

export default function Home() {
  return (
    <>
      <h1>Página principalll</h1>
      <Link href="/usuarios">Ir a Usuarios</Link>
    </>
  );
}