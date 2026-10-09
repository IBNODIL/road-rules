import type { Metadata } from "next";
import { ParkingSim } from "@/components/sim/lazy";

export const metadata: Metadata = {
  title: "Parking simulator",
  description: "Drive a car in 3D and practise perpendicular, parallel and reverse garage parking with live scoring.",
};

export default function SimulatorPage() {
  return <ParkingSim />;
}
