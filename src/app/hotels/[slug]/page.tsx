"use client";

import { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Galleria } from 'primereact/galleria';
import { Nullable } from "primereact/ts-helpers";
import { useParams, useRouter, useSearchParams  } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faMapMarkerAlt, faWifi, faSwimmingPool, faParking, faConciergeBell, faUtensils, faDumbbell, faBusinessTime, faBellConcierge, faSpa, faChampagneGlasses, faBowlFood, faClock, faMartiniGlass, faChurch, faBagShopping, faChildren } from "@fortawesome/free-solid-svg-icons";
import { faHandshake } from "@fortawesome/free-solid-svg-icons/faHandshake";

interface City {
    id: number;
    name: string;
    country: string;
  }
  
  interface Hotel {
    id: number;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    star: number;
    city: City;
    facilities: string[];
    images: string[];
    policy: string;
    rooms: Room[];
  }
  
  interface Room {
    id: number;
    name: string;
    size: number;
    facilities: string[];
    images: string[];
    is_breakfast_included: boolean;
    guest_capacity: number;
    bed_type: string;
    price: number;
    total_rooms: number;
    available_rooms: number;
  }
  
  interface ApiResponseCities {
    success: boolean;
    statusCode: number;
      data: City[];
  }
  interface ApiResponse {
    success: boolean;
    statusCode: number;
    data: {
      data: Hotel[];
    };
  }
  
  const facilityIcons: Record<string, any> = {
    "Spa":faSpa,
    "Luxury Spa":faSpa,
    "Spa & Wellness":faSpa,
    "WiFi": faWifi,
    "Rooftop Swimming Pool": faSwimmingPool,
    "Infinity Pool": faSwimmingPool,
    "Swimming Pool": faSwimmingPool,
    "Parking": faParking,
    "Concierge": faConciergeBell,
    "Fine Dining Restaurant": faUtensils,
    "Fitness Center": faDumbbell,
    "Business Center": faBusinessTime,
    "Ballroom":faChampagneGlasses,
    "Grand Ballroom":faMartiniGlass,
    "Meeting Rooms":faHandshake,
    "Meeting Facilities":faHandshake,
    "Executive Lounge" : faChampagneGlasses,
    "Multiple Restaurants":faUtensils,
    "24-hour Room Service": faClock,
    "Wedding Chapel": faChurch,
    "Direct Mall Access": faBagShopping,
    "Kids Club": faChildren,
  };

export default function SearchPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [datas, setData] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({
    selectedCity: null as Number | null,
    date: null as Nullable<(Date | null)[]>,
    dates: null as any,
    adults: 0,
    child: 0,
  });

  console.log('slug hotel', slug);
  const calculateDateRange = (date: string | null, night: number) => {
    if (!date) return null;
    const checkIn = new Date(date);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + night);
    return [checkIn, checkOut];
  };

  const fetchSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search/${slug}`);
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: ApiResponse = await res.json();
      // console.log(data);
      if (data.data.data.length > 0) {
        setData(data.data.data);
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

    const fetchCities = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cities");
        if (!res.ok) {
          throw new Error("Failed to fetch dadta");
        }
        const data: ApiResponseCities = await res.json();
        console.log(data);
        setCities(data.data);
      } catch (err) {
        setError((err as Error).message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    const decodedString = decodeURIComponent(Array.isArray(slug) ? slug[0] : slug ?? "");
    const params = new URLSearchParams(decodedString);

    const searchDatas = {
      city_id: params.get("city_id"),
      date: params.get("date"),
      nights : parseInt(params.get("nights") ?? "0", 10),
      adult_guests : parseInt(params.get("adult_guests") ?? "1", 10),
      child_guests : parseInt(params.get("child_guests") ?? "0", 10),
    };
  
  useEffect(() => {    
    setSearchData({
      selectedCity: searchDatas.city_id ? Number(searchDatas.city_id) : null,
      date: searchDatas.date ? [new Date(searchDatas.date)] : null,
      dates: calculateDateRange(searchDatas.date, searchDatas.nights),
      adults: searchDatas.adult_guests,
      child: searchDatas.child_guests,
      });
      fetchCities();
      fetchSearch();
  }, []);

  const handleSubmit = async (id:number) => {
    
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
      hotel_id:id.toString(),
      city_id: searchData.selectedCity.toString(),
      date: checkInDate.toISOString().split("T")[0], 
      nights: nights.toString(),
      adult_guests: searchData.adults.toString(),
      child_guests: searchData.child.toString(),
    });
  
    const slug =params.toString()
    console.log("Query Params:", params.toString());

    router.push(`/hotels/detail/${slug}`);
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  const itemTemplate = (item:any) => {
        return <img src={item.image} alt={item.alt} style={{ width: '400px', display: 'block', margin:"10px",borderRadius:'8px' }} />;
    };
  return (
    <div className="relative w-full h-screen bg-cover bg-center">
      {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
      <div className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg mb-4">
        <div>
          <p className="text-gray-500 text-sm">Kota/Nama Hotel/ Destinasi</p>
          <Dropdown
                value={cities.find(city => city.id === searchData.selectedCity)}
                options={cities}
                onChange={(e) => setSearchData({ ...searchData, selectedCity: e.value.id })}
                optionLabel="name"
                placeholder="Pilih Kota"
                className="w-full"
              />
          {/* <p className="font-bold text-lg">{searchData.selectedCity ? `City ID: ${searchData.selectedCity}` : "-"}</p> */}
        </div>
        <div>
          <p className="text-gray-500 text-sm">Tanggal Menginap</p>
          <Calendar
                value={searchData.dates}
                onChange={(e) => setSearchData({ ...searchData, dates: e.value })}
                selectionMode="range"
                readOnlyInput
                placeholder="Pilih tanggal"
                hideOnRangeSelection
                className="w-full"
              />
          {/* <p className="font-bold text-lg">{searchData.dates ? searchData.dates.map(date => date?.toLocaleDateString()).join(" - ") : "-"}</p> */}
        </div>
        <div>
          <p className="text-gray-500 text-sm">Jumlah Tamu dan Kamar</p>
          <p className="font-bold text-lg">
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
              <span className="mr-3">
               Tamu

              </span>
               
               <InputNumber
                value={searchData.child}
                min={1} 
                onValueChange={(e: InputNumberValueChangeEvent) => setSearchData({ ...searchData, child: e.value || 0 })} 
                showButtons buttonLayout="horizontal"
                decrementButtonClassName="p-button-secondary" 
                incrementButtonClassName="p-button-secondary" 
                incrementButtonIcon="pi pi-plus" 
                decrementButtonIcon="pi pi-minus" 
                inputStyle={{ width: "3rem", textAlign: "center" }}
              /> Anak
              </p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Ubah Pencarian</button>
      </div>

      <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Hasil Pencarian</h1>
      <div className="flex flex-col gap-6">
        {datas.map((hotel) => (
          <div key={hotel.id} className="flex border rounded-lg shadow-md overflow-hidden">
            <Galleria value={hotel.images.map((img) => ({ image: img }))} style={{ maxWidth: '640px' }} changeItemOnIndicatorHover showThumbnails={false} showIndicators item={itemTemplate} />
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-bold">{hotel.name}</h2>
              <p className="text-gray-600 flex items-center gap-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" style={{ color: "red" }} /> {hotel.address}
              </p>
              <div className="flex items-center gap-1 text-yellow-500 my-2">
                {[...Array(hotel.star)].map((_, i) => (
                  <i key={i} className="pi pi-star-fill"></i>
                ))}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
              {hotel.facilities.map((facility, index) => (
                <div key={index} className="flex items-center gap-1 text-blue-500">
                  {facilityIcons[facility] ? (
                    <FontAwesomeIcon icon={facilityIcons[facility]} />
                  ) : (
                    <span className="text-gray-700">{facility}</span>
                  )}
                  </div>
              ))}
              </div>
              <div className="mt-auto flex justify-between items-center">
                <p className="text-lg font-semibold text-blue-600">IDR {hotel.rooms[0]?.price.toLocaleString()} /malam</p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer" onClick={() => handleSubmit(hotel.id)}>Lihat Detail</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
