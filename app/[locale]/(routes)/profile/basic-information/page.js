"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Input from "@/app/[locale]/components/forms/Input";
import Button from "@/app/[locale]/components/buttons/Button";

const FIELDS = [
  { id: "first_name", name: "first_name", label: "First Name" },
  { id: "last_name", name: "last_name", label: "Last Name" },
  { id: "date", name: "date", label: "Date of Birth", type: "date" },
  { id: "sex", name: "sex", label: "Sex" },
  {
    id: "phone_number",
    name: "phone_number",
    label: "Phone Number",
    type: "tel",
  },
  { id: "address", name: "address", label: "Address" },
  { id: "zip", name: "zip", label: "ZIP Code" },
  { id: "city", name: "city", label: "City" },
  { id: "country", name: "country", label: "Country" },
];

const BasicInformationPage = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [form, setForm] = useState({});
  const [original, setOriginal] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/user-profile")
      .then((res) => res.json())
      .then((data) => {
        const profile = data.profile ?? {};
        setForm(profile);
        setOriginal(profile);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleEdit = () => {
    setOriginal(form);
    setEditMode(true);
    setSuccess(false);
    setError("");
  };

  const handleCancel = () => {
    setForm(original);
    setEditMode(false);
    setError("");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        const updated = data.profile ?? form;
        setForm(updated);
        setOriginal(updated);
        setEditMode(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 900);
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-3 py-6 sm:px-4 sm:py-10 text-white">
      <section className="mx-auto max-w-3xl relative bg-teal-400/10 backdrop-blur-lg overflow-hidden rounded-lg border border-teal-500/20 p-4 sm:p-6">
        <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-500/40 blur-[80px]" />

        <div className="relative z-10 flex items-center justify-between">
          <h1 className="primary text-3xl sm:text-5xl uppercase leading-none text-teal-500">
            Basic Info
          </h1>
          <Button
            text="Back to Profile"
            variant="outline"
            href={`/${locale}/profile`}
            className="shrink-0 text-xs py-1.5 px-3"
          />
        </div>

        {loading ? (
          <p className="secondary mt-8 text-sm text-white/40">Loading...</p>
        ) : (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5 relative z-10">
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <Input
                  key={field.id}
                  data={field}
                  value={form[field.name] ?? ""}
                  onChange={handleChange(field.name)}
                  disabled={!editMode || isSubmitting}
                />
              ))}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-teal-400/35 bg-teal-500/10 px-4 py-3 text-sm text-teal-200">
                Profile updated successfully.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {editMode ? (
                <>
                  <Button
                    text={isSubmitting ? "Saving..." : "Save"}
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto py-2.5"
                  />
                  <Button
                    text="Cancel"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto py-2.5"
                  />
                </>
              ) : (
                <Button text="Edit" onClick={handleEdit} className="w-full sm:w-auto py-2.5" />
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default BasicInformationPage;

