import type { Metadata } from "next";
import { ParkingSim } from "@/components/sim/lazy";

export const metadata: Metadata = {
  title: "Parking simulator",
  description: "Drive a car in 3D and practise angled, reverse, parallel, garage and car park stages and a cone course, with live scoring.",
};

export default function SimulatorPage() {
  return <ParkingSim />;
}
