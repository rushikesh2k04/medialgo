import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";

type Props = {
  onComplete: () => void;
};

const ProfileForm: React.FC<Props> = ({ onComplete }) => {
  const { role, setProfile } = useUser();
  const [form, setForm] = useState({
    name: "",
    speciality: "",
    license: "",
    age: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert age to number if present, otherwise undefined
    setProfile({
      ...form,
      age: form.age ? Number(form.age) : undefined,
    });
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      {role === "doctor" && (
        <>
          <input name="speciality" placeholder="Speciality" value={form.speciality} onChange={handleChange} required />
          <input name="license" placeholder="License" value={form.license} onChange={handleChange} required />
        </>
      )}
      {role === "patient" && (
        <input name="age" placeholder="Age" value={form.age} onChange={handleChange} required />
      )}
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <button type="submit">Save Profile</button>
    </form>
  );
};

export default ProfileForm;
