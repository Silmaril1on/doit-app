"use client";
import React, { useState } from "react";
import ToggleButton from "../../../components/buttons/ToggleButton";
import ItemCard from "../../../components/container/ItemCard";
import Colors from "./Colors";

const Sound = () => {
  return (
    <ItemCard>
      <p className="secondary text-chino/60 text-sm">
        Sound settings coming soon.
      </p>
    </ItemCard>
  );
};

const Customization = () => {
  const [tab, setTab] = useState("COLORS");

  return (
    <div className="page-wrapper space-y-4">
      <ToggleButton
        variant="layout"
        options={["COLORS", "SOUND"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "COLORS" ? <Colors /> : <Sound />}
    </div>
  );
};

export default Customization;
