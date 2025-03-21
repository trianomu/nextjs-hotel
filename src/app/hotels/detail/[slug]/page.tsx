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
import ImageCarousel from "@/components/ImageCarousel";

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

  interface RoomOption {
    title: string;
    refundable: boolean;
    reschedulable: boolean;
    guests: number;
    bed: string;
    breakfast: boolean;
    wifi: boolean;
    price: string;
    oldPrice?: string;
    facilities: string[];
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
          <div className="font-bold text-lg text-center">
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
            <span className="mr-2">
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
          </div>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Ubah Pencarian</button>
      </div>

      <div className="max-w-6xl mx-auto py-6">
      <div className="flex flex-col gap-8">
        {datas?.map((hotel) => (
          <div key={hotel.id} className="border rounded-lg shadow-lg overflow-hidden p-6">
            {/* Image Gallery */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Galleria
                  value={hotel?.images?.map((img) => ({ image: img }))}
                  style={{ maxWidth: "100%" }}
                  changeItemOnIndicatorHover
                  showThumbnails={false}
                  showIndicators
                  item={(item) => <img src={item.image} alt="hotel" className="w-full rounded-lg" />}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {hotel?.images?.slice(0, 4).map((img, index) => (
                  <img key={index} src={img} alt="hotel-thumbnail" className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            </div>

            {/* Hotel Info */}
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-1">{hotel.name}</h2>
              <p className="text-gray-600 flex items-center gap-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500" /> {hotel.address}
              </p>
              <div className="flex items-center gap-1 text-yellow-500 my-2">
                {[...Array(hotel.star)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-3">{hotel.description}</p>

              {/* Hotel Facilities */}
                <div>
                <h3><strong>Fasilitas Hotel</strong></h3>
                </div>
              <div className="grid grid-cols-4 gap-3 text-gray-600 text-sm">
                {hotel.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center gap-1 text-blue-500">
                    <FontAwesomeIcon icon={facilityIcons[facility] || faSwimmingPool} />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Booking */}
            <div className="room-list-container mt-8">
              {hotel?.rooms?.map((room, index) => (
                <div key={index} className="room-section flex align-center my-4">
                  <div className="room-info gap-4 mr-3 flex-col md:flex-row bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    <div className="image-container w-60 h-60 m- ">
                      <ImageCarousel images={room.images} />
                    </div>
                    <div className="room-details flex justify-around m-2">
                      <h3>{room.name}</h3>
                      <p>{room.size}m</p>
                    </div>
                  </div>

                  <div className="room-options w-3/4 flex flex-col md:flex-row bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                    {/* Image & Room Info */}
                    <div className="w-full md:w-1/3 p-4 flex flex-col flex-start">
                      <h4 className="text-xl font-bold text-gray-800">{room.name}</h4>
                      <div className="room-details text-gray-600 my-3">
                        <p>👥 {room.guest_capacity} Tamu</p>
                        <p>🛏 {room.bed_type}</p>
                      </div>
                      <p className={`text-sm mt-2 font-medium ${room.is_breakfast_included ? "text-green-600" : "text-red-600"}`}>
                          {room.is_breakfast_included ? "✅ Termasuk sarapan" : "❌ Tidak termasuk sarapan"}
                      </p>
                    </div>

                    {/* Facilities & Pricing */}
                    <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        
                        <ul className="mt-2 text-gray-600 text-sm">
                          {room.facilities.map((facility, fIdx) => (
                            <li key={fIdx}>✅ {facility}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Harga & Tombol */}
                      <div className="mt-6 flex justify-between items-center">
                        <p className="text-lg font-semibold text-blue-600">
                          IDR {room?.price.toLocaleString()} / malam
                        </p>
                        <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300">
                          Pilih Kamar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
