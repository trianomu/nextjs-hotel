import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const slug  = (await params).slug;
  try {
    // Make the API request
    const response = await fetch(`https://ota-gin.onrender.com/api/v1/hotels/search?${slug}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`, // Send JWT via Authorization header
      },
    });

    // Check if the response is not successful
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error: "Failed to fetch data from API",
          details: errorData,
        },
        { status: response.status }
      );
    }
    // Parse and return the API response
    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error: unknown) {
    // Type narrowing to safely access properties
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Server error occurred",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}