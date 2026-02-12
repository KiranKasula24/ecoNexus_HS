"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type PrimaryMaterial = {
  name: string;
  category: string;
  subtype: string;
  monthlyVolume: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  recycledContentPercent: number;
  processStep: string;
};

type WasteGenerated = {
  materialName: string;
  materialCategory: string;
  materialSubtype: string;
  physicalForm: string;
  monthlyVolume: number;
  unit: string;
  qualityGrade: "A" | "B" | "C" | "D";
  contaminationLevel: number;
  moistureContent: number;
  carbonFootprint: number;
  waterUsage: number;
  energyConsumption: number;
  currentDisposalCost: number;
  potentialValue: number;
  classification:
    | "reusable"
    | "processable"
    | "recyclable"
    | "energy_recovery"
    | "landfill";
  generationFrequency: string;
  storageLocation: string;
  isHazardous: boolean;
  wasteCode: string;
  regulatoryClassification: string;
};

const defaultPrimaryMaterials: PrimaryMaterial[] = [
  {
    name: "",
    category: "",
    subtype: "",
    monthlyVolume: 0,
    unit: "tons",
    costPerUnit: 0,
    supplier: "",
    recycledContentPercent: 0,
    processStep: "",
  },
  {
    name: "",
    category: "",
    subtype: "",
    monthlyVolume: 0,
    unit: "tons",
    costPerUnit: 0,
    supplier: "",
    recycledContentPercent: 0,
    processStep: "",
  },
  {
    name: "",
    category: "",
    subtype: "",
    monthlyVolume: 0,
    unit: "tons",
    costPerUnit: 0,
    supplier: "",
    recycledContentPercent: 0,
    processStep: "",
  },
];

const defaultWasteGenerated: WasteGenerated = {
  materialName: "",
  materialCategory: "",
  materialSubtype: "",
  physicalForm: "",
  monthlyVolume: 0,
  unit: "tons",
  qualityGrade: "C",
  contaminationLevel: 0,
  moistureContent: 0,
  carbonFootprint: 0,
  waterUsage: 0,
  energyConsumption: 0,
  currentDisposalCost: 0,
  potentialValue: 0,
  classification: "recyclable",
  generationFrequency: "daily",
  storageLocation: "",
  isHazardous: false,
  wasteCode: "",
  regulatoryClassification: "",
};

const materialCategories = [
  "metal",
  "plastic",
  "paper",
  "glass",
  "textile",
  "electronic",
  "organic",
  "chemical",
];
const units = ["tons", "kg", "liters", "cubic_meters", "pieces"];
const physicalForms = [
  "solid",
  "liquid",
  "powder",
  "granular",
  "sheet",
  "scrap",
  "mixed",
];

export default function MaterialFlowFormPage() {
  const router = useRouter();
  const { company } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [primaryMaterials, setPrimaryMaterials] = useState<PrimaryMaterial[]>(
    defaultPrimaryMaterials,
  );
  const [wasteGenerated, setWasteGenerated] = useState<WasteGenerated>(
    defaultWasteGenerated,
  );

  const updatePrimaryMaterial = (
    index: number,
    field: keyof PrimaryMaterial,
    value: string | number,
  ) => {
    setPrimaryMaterials((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const updateWasteGenerated = (
    field: keyof WasteGenerated,
    value: string | number | boolean,
  ) => {
    setWasteGenerated((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!company?.id) {
      setError("Company context is missing. Please log in again.");
      return;
    }

    const hasInvalidPrimary = primaryMaterials.some(
      (item) =>
        !item.name.trim() ||
        !item.category.trim() ||
        Number(item.monthlyVolume) <= 0 ||
        !item.unit,
    );

    if (hasInvalidPrimary) {
      setError(
        "Please complete all required fields for all 3 primary materials.",
      );
      return;
    }

    if (
      !wasteGenerated.materialName.trim() ||
      !wasteGenerated.materialCategory.trim() ||
      !wasteGenerated.physicalForm.trim() ||
      Number(wasteGenerated.monthlyVolume) <= 0
    ) {
      setError("Please complete required waste generated details.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/materials/flow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🔥 ADD THIS
        body: JSON.stringify({
          company_id: company.id,
          primaryMaterials,
          wasteGenerated,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create material flow");
      }

      router.push(`/passports/${data.passport.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create material flow and passport.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Waste Stream Passport Creation
        </h1>
        <p className="mt-2 text-gray-600">
          Enter 3 primary materials used and detailed waste generation data to
          generate a waste-stream passport.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Primary Materials Used (Exactly 3)
          </h2>
          <p className="text-sm text-gray-600">
            These are your process inputs. Passport generation will use waste
            stream data only.
          </p>

          {primaryMaterials.map((material, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">
                Primary Material {index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={material.name}
                  onChange={(e) =>
                    updatePrimaryMaterial(index, "name", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                  placeholder="Material name"
                />
                <select
                  required
                  value={material.category}
                  onChange={(e) =>
                    updatePrimaryMaterial(index, "category", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                >
                  <option value="">Category</option>
                  {materialCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={material.subtype}
                  onChange={(e) =>
                    updatePrimaryMaterial(index, "subtype", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                  placeholder="Subtype"
                />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={material.monthlyVolume || ""}
                  onChange={(e) =>
                    updatePrimaryMaterial(
                      index,
                      "monthlyVolume",
                      Number(e.target.value),
                    )
                  }
                  className="rounded-md border-gray-300"
                  placeholder="Monthly usage"
                />
                <select
                  value={material.unit}
                  onChange={(e) =>
                    updatePrimaryMaterial(index, "unit", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={material.costPerUnit || ""}
                  onChange={(e) =>
                    updatePrimaryMaterial(
                      index,
                      "costPerUnit",
                      Number(e.target.value),
                    )
                  }
                  className="rounded-md border-gray-300"
                  placeholder="Cost per unit"
                />
                <input
                  type="text"
                  value={material.supplier}
                  onChange={(e) =>
                    updatePrimaryMaterial(index, "supplier", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                  placeholder="Supplier"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={material.recycledContentPercent || ""}
                  onChange={(e) =>
                    updatePrimaryMaterial(
                      index,
                      "recycledContentPercent",
                      Number(e.target.value),
                    )
                  }
                  className="rounded-md border-gray-300"
                  placeholder="Recycled content %"
                />
                <input
                  type="text"
                  value={material.processStep}
                  onChange={(e) =>
                    updatePrimaryMaterial(index, "processStep", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                  placeholder="Process step usage"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Waste Generated (Passport Source)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={wasteGenerated.materialName}
              onChange={(e) =>
                updateWasteGenerated("materialName", e.target.value)
              }
              className="rounded-md border-gray-300"
              placeholder="Waste material name"
            />
            <select
              required
              value={wasteGenerated.materialCategory}
              onChange={(e) =>
                updateWasteGenerated("materialCategory", e.target.value)
              }
              className="rounded-md border-gray-300"
            >
              <option value="">Material category</option>
              {materialCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={wasteGenerated.materialSubtype}
              onChange={(e) =>
                updateWasteGenerated("materialSubtype", e.target.value)
              }
              className="rounded-md border-gray-300"
              placeholder="Material subtype"
            />
            <select
              required
              value={wasteGenerated.physicalForm}
              onChange={(e) =>
                updateWasteGenerated("physicalForm", e.target.value)
              }
              className="rounded-md border-gray-300"
            >
              <option value="">Physical form</option>
              {physicalForms.map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </select>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={wasteGenerated.monthlyVolume || ""}
              onChange={(e) =>
                updateWasteGenerated("monthlyVolume", Number(e.target.value))
              }
              className="rounded-md border-gray-300"
              placeholder="Waste generated per month"
            />
            <select
              value={wasteGenerated.unit}
              onChange={(e) => updateWasteGenerated("unit", e.target.value)}
              className="rounded-md border-gray-300"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            <select
              value={wasteGenerated.qualityGrade}
              onChange={(e) =>
                updateWasteGenerated("qualityGrade", e.target.value)
              }
              className="rounded-md border-gray-300"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={wasteGenerated.contaminationLevel || ""}
              onChange={(e) =>
                updateWasteGenerated(
                  "contaminationLevel",
                  Number(e.target.value),
                )
              }
              className="rounded-md border-gray-300"
              placeholder="Contamination %"
            />
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={wasteGenerated.moistureContent || ""}
              onChange={(e) =>
                updateWasteGenerated("moistureContent", Number(e.target.value))
              }
              className="rounded-md border-gray-300"
              placeholder="Moisture %"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={wasteGenerated.carbonFootprint || ""}
              onChange={(e) =>
                updateWasteGenerated("carbonFootprint", Number(e.target.value))
              }
              className="rounded-md border-gray-300"
              placeholder="Carbon footprint"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={wasteGenerated.waterUsage || ""}
              onChange={(e) =>
                updateWasteGenerated("waterUsage", Number(e.target.value))
              }
              className="rounded-md border-gray-300"
              placeholder="Water usage"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={wasteGenerated.energyConsumption || ""}
              onChange={(e) =>
                updateWasteGenerated(
                  "energyConsumption",
                  Number(e.target.value),
                )
              }
              className="rounded-md border-gray-300"
              placeholder="Energy consumption"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={wasteGenerated.currentDisposalCost || ""}
              onChange={(e) =>
                updateWasteGenerated(
                  "currentDisposalCost",
                  Number(e.target.value),
                )
              }
              className="rounded-md border-gray-300"
              placeholder="Current disposal cost / month"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={wasteGenerated.potentialValue || ""}
              onChange={(e) =>
                updateWasteGenerated("potentialValue", Number(e.target.value))
              }
              className="rounded-md border-gray-300"
              placeholder="Potential recoverable value"
            />
            <select
              value={wasteGenerated.classification}
              onChange={(e) =>
                updateWasteGenerated("classification", e.target.value)
              }
              className="rounded-md border-gray-300"
            >
              <option value="recyclable">recyclable</option>
              <option value="reusable">reusable</option>
              <option value="processable">processable</option>
              <option value="energy_recovery">energy_recovery</option>
              <option value="landfill">landfill</option>
            </select>
            <select
              value={wasteGenerated.generationFrequency}
              onChange={(e) =>
                updateWasteGenerated("generationFrequency", e.target.value)
              }
              className="rounded-md border-gray-300"
            >
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="monthly">monthly</option>
              <option value="irregular">irregular</option>
            </select>
            <input
              type="text"
              value={wasteGenerated.storageLocation}
              onChange={(e) =>
                updateWasteGenerated("storageLocation", e.target.value)
              }
              className="rounded-md border-gray-300"
              placeholder="Storage location"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={wasteGenerated.isHazardous}
                onChange={(e) =>
                  updateWasteGenerated("isHazardous", e.target.checked)
                }
              />
              Hazardous waste
            </label>
            <input
              type="text"
              value={wasteGenerated.wasteCode}
              onChange={(e) =>
                updateWasteGenerated("wasteCode", e.target.value)
              }
              className="rounded-md border-gray-300"
              placeholder="Waste code"
            />
            <input
              type="text"
              value={wasteGenerated.regulatoryClassification}
              onChange={(e) =>
                updateWasteGenerated("regulatoryClassification", e.target.value)
              }
              className="rounded-md border-gray-300"
              placeholder="Regulatory classification"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          On submit, the system will create the material flow, create a waste
          stream, generate the digital passport for that waste stream, and open
          the passport page for document upload and verification.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Material Flow & Passport"}
        </button>
      </form>
    </div>
  );
}
