"use client";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import 'primeicons/primeicons.css';

export default function PrimeReactProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
