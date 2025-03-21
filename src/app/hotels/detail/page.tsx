"use client";

import { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Galleria } from 'primereact/galleria';
import { Nullable } from "primereact/ts-helpers";
import router from "next/router";
import { useParams, useRouter } from "next/navigation";
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
  const [datas, setData] = useState<Hotel[]>([]);
  
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchData,setSearchData] = useState({
    selectedCity: null as City | null,
    dates: null as Nullable<(Date | null)[]>,
    adults: 1,
    child: 0,
  });

  console.log('slug detail',slug);
//   console.log("detail :",searchData);
  const fetchSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?${slug}`);
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: ApiResponse = await res.json();
      console.log("detail data",data);
      if (data.data.data.length > 0) {
        setData(data.data.data);
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearch();
  }, []);

  
  const handleSubmit = async (hotel_id:number) => {
    console.log(hotel_id);
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
      adults: searchData.adults.toString(),
      children: searchData.child.toString(),
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
      <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Hasil Pencarian Detail</h1>
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
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md"  onClick={()=>handleSubmit(hotel.id)}>Lihat Detail</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}