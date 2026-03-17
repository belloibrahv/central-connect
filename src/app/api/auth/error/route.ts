import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "Access denied. Please contact support.",
    Verification: "The verification link has expired or is invalid.",
    Default: "An error occurred during authentication."
  };

  const message = errorMessages[error || "Default"] || errorMessages.Default;

  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}
