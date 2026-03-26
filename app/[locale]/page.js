"use client";
import { FaHouseUser } from "react-icons/fa";
import ActionButton from "./components/buttons/ActionButton";
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
      <ActionButton icon={<FaHouseUser size={20} />} />
    </div>
  );
}
