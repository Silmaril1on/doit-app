"use client";
import { FaHouseUser } from "react-icons/fa";
import Button from "./components/buttons/Button";
import ToggleButton from "./components/buttons/ToggleButton";
import { useState } from "react";
import ItemCard from "./components/container/ItemCard";

const NAV_OPTIONS = ["History", "Night Life", "Sport"];

export default function HomePage() {
  const [filter, setFilter] = useState("History");

  return (
    <div className="flex grow flex-col gap-5 items-center bg-cream dark:bg-black p-8">
      <ItemCard className="w-98">
        <h1 className="text-cream text-2xl">hello home page</h1>
      </ItemCard>
    </div>
  );
}
