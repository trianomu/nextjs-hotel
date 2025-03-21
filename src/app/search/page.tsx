"use client";

import { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Nullable } from "primereact/ts-helpers";
import { useRouter } from "next/navigation";

interface City {
  id: number;
  name: string;
  country: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: City[];
}

export default function SearchPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    selectedCity: null as City | null,
    dates: null as Nullable<(Date | null)[]>,
    adults: 2,
    child: 0,
  });

  console.log(searchData);
  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cities");
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: ApiResponse = await res.json();
      setCities(data.data);
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  
  const handleSubmit = async () => {
    
    if (!searchData.selectedCity || !searchData.dates || searchData.dates.length < 2) {
      alert("Harap pilih kota dan tanggal check-in/check-out!");
      return;
    }
  
    const checkInDate = searchData.dates[0]; 
    const checkOutDate = searchData.dates[1]; 
  
    if (!checkInDate || !checkOutDate) {
      alert("Tanggal tidak valid!");
      return;
    }
  
    const nights = Math.max(1, Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  
    const params = new URLSearchParams({
      city_id: searchData.selectedCity.id.toString(),
      date: checkInDate.toISOString().split("T")[0], // Format YYYY-MM-DD
      nights: nights.toString(),
      adult_guests: searchData.adults.toString(),
      child_guests: searchData.child.toString(),
    });
  
    const slug =params.toString()
    console.log("Query Params:", params.toString());

    router.push(`/hotels/${slug}`);
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="relative w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('/assets/hotel-bg.jpeg')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="flex flex-col items-center justify-center h-full bg-cover bg-center relative">
        <h1 className="text-white text-2xl font-bold text-center mb-4">Staycation menjadi lebih mudah hanya dengan satu klik</h1>
        <div className="bg-white bg-opacity-50 p-8 rounded-lg shadow-lg w-full max-w-6xl relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-center text-center">
            <div>
              <label className="block text-gray-700 mb-1">Kota</label>
              <Dropdown
                value={searchData.selectedCity}
                options={cities}
                onChange={(e) => setSearchData({ ...searchData, selectedCity: e.value })}
                optionLabel="name"
                placeholder="Pilih Kota"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Tanggal Check-in & Check-out</label>
              <Calendar
                value={searchData.dates}
                onChange={(e) => setSearchData({ ...searchData, dates: e.value })}
                selectionMode="range"
                readOnlyInput
                placeholder="Pilih tanggal"
                hideOnRangeSelection
                className="w-full"
              />
            </div>
            <div className="align-center">
              <label className="block text-gray-700 mb-1">Jumlah Dewasa</label>
              <InputNumber
                value={searchData.adults}
                min={1} 
                onValueChange={(e: InputNumberValueChangeEvent) => setSearchData({ ...searchData, adults: e.value || 1 })} 
                showButtons buttonLayout="horizontal" 
                decrementButtonClassName="p-button-secondary" 
                incrementButtonClassName="p-button-secondary" 
                incrementButtonIcon="pi pi-plus" 
                decrementButtonIcon="pi pi-minus" 
                inputStyle={{ width: "3rem", textAlign: "center" }}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Jumlah Anak-anak</label>
              <InputNumber
                value={searchData.child}
                min={0} 
                onValueChange={(e: InputNumberValueChangeEvent) => setSearchData({ ...searchData, child: e.value || 0 })} 
                showButtons buttonLayout="horizontal" 
                decrementButtonClassName="p-button-secondary" 
                incrementButtonClassName="p-button-secondary" 
                incrementButtonIcon="pi pi-plus" 
                decrementButtonIcon="pi pi-minus" 
                inputStyle={{ width: "3rem", textAlign: "center" }}
              />
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <Button label="Cari Hotel" icon="pi pi-search" className="p-button-primary" onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}
