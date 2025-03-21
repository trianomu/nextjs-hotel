// app/lib/fetchCities.ts
export async function fetchCities() {
    const res = await fetch("https://ota-gin.onrender.com/api/v1/cities", {
      cache: "no-store", // Ensure fresh data on each request
    });
  
    if (!res.ok) throw new Error("Failed to fetch cities");
  
    const data = await res.json();
    return data.data;
  }
  