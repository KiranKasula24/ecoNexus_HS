"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface PassportCardProps {
  passportId: string;
}

export function PassportCard({ passportId }: PassportCardProps) {
  const [passport, setPassport] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassport();
    fetchQRCode();
  }, [passportId]);

  const fetchPassport = async () => {
    try {
      const res = await fetch(`/api/digital-passport/${passportId}`);
      const data = await res.json();
      setPassport(data.passport);
    } catch (error) {
      console.error("Failed to fetch passport:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    try {
      const res = await fetch(`/api/digital-passport/${passportId}/qr`);
      const data = await res.json();
      setQrCode(data.qr_code);
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
    }
  };

  if (loading) {
    return <div className="p-6 border rounded-lg">Loading passport...</div>;
  }

  if (!passport) {
    return (
      <div className="p-6 border rounded-lg text-red-600">
        Passport not found
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-lg p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">Material Passport</h2>
          <p className="text-sm text-gray-500">
            ID: {passport.id.slice(0, 8)}...
          </p>
        </div>
        {qrCode && <img src={qrCode} alt="QR Code" className="w-24 h-24" />}
      </div>

      {/* Material Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-600">Category</label>
          <p className="text-lg capitalize">{passport.material_category}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Subtype</label>
          <p className="text-lg capitalize">{passport.material_subtype}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">
            Physical Form
          </label>
          <p className="text-lg capitalize">{passport.physical_form}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Volume</label>
          <p className="text-lg">
            {passport.volume} {passport.unit}
          </p>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="border-t pt-4 mb-6">
        <h3 className="font-semibold mb-3">Quality Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Quality Grade</label>
            <p className="text-2xl font-bold">
              {passport.quality_grade || "N/A"}
            </p>
            <p className="text-xs text-gray-500">
              Tier {passport.quality_tier || "-"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Contamination</label>
            <p className="text-2xl font-bold">
              {passport.contamination_level || 0}%
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Carbon Footprint</label>
            <p className="text-2xl font-bold">
              {passport.carbon_footprint || "-"}
            </p>
            <p className="text-xs text-gray-500">kg CO₂</p>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm text-gray-600">Verification Status</label>
            <p
              className={`text-lg font-semibold ${
                passport.verification_status === "verified"
                  ? "text-green-600"
                  : passport.verification_status === "pending"
                    ? "text-yellow-600"
                    : "text-gray-400"
              }`}
            >
              {passport.verification_status || "Unverified"}
            </p>
          </div>
          {passport.verification_score && (
            <div className="text-right">
              <label className="text-sm text-gray-600">
                Verification Score
              </label>
              <p className="text-2xl font-bold">
                {passport.verification_score}/100
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          View Full History
        </button>
        <button className="px-4 py-2 border rounded hover:bg-gray-50">
          Download QR Code
        </button>
        <button className="px-4 py-2 border rounded hover:bg-gray-50">
          Upload Document
        </button>
      </div>
    </div>
  );
}
