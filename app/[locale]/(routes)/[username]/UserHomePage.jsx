"use client";
import React, { useState } from "react";
import AppImage from "../../components/elements/ImageTag";
import { useDispatch } from "react-redux";
import { sendFriendRequest } from "../../lib/services/user/friendships";
import { setToast } from "../../lib/features/toastSlice";
import Button from "../../components/buttons/Button";

const UserHomePage = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleAdd = async () => {
    setLoading(true);
    try {
      await sendFriendRequest(user?.id);
      dispatch(setToast({ msg: "Friend request sent!", type: "success" }));
    } catch (err) {
      dispatch(setToast({ msg: err.message, type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-lg rounded-2xl border border-teal-500/20 bg-teal-800/40 backdrop-blur-md p-8 flex flex-col items-center gap-6">
        {/* Avatar */}
        <AppImage
          src={user.image_url}
          alt={user.display_name}
          fill
          className="object-cover"
        />

        {/* Name */}
        <div className="text-center">
          <h1 className="primary text-3xl text-cream">{user.display_name}</h1>
          <p className="secondary text-sm text-teal-400 mt-0.5">
            @{user.display_name}
          </p>
        </div>

        {/* Details */}
        <div className="w-full flex flex-col gap-2">
          {user.email && <ProfileRow label="Email" value={user.email} />}
          {user.address && <ProfileRow label="Address" value={user.address} />}
        </div>

        <Button
          text={loading ? "Sending…" : "Add Friend"}
          onClick={handleAdd}
          disabled={loading}
        />
      </div>
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-teal-500/10 bg-teal-500/5 px-4 py-2.5">
    <span className="secondary text-xs text-cream/40 w-16 shrink-0">
      {label}
    </span>
    <span className="secondary text-sm text-cream/80 truncate">{value}</span>
  </div>
);

export default UserHomePage;
